/**
 * Tunnel module — ngrok backend.
 *
 * One-click public-tunnel support for the Unified Proxy (port 8000) using
 * ngrok's free tier. The user pastes their ngrok authtoken once, the
 * binary is downloaded automatically, and starting the tunnel produces a
 * URL that:
 *   - never goes "dead" mid-session (ngrok maintains a persistent connection
 *     to its edge),
 *   - has no cold-start 502s (the edge route is always registered),
 *   - works through NAT and restrictive networks.
 *
 * Persistence (`userData/tunnel-config.json`):
 *   {
 *     enabled: boolean,            // ignored today, reserved for auto-start
 *     authtoken: string | null,    // ngrok user authtoken
 *     updatedAt: string,
 *   }
 *
 * Binary lives at `userData/bin/ngrok.exe`, downloaded on demand from the
 * official ngrok release CDN.
 */

const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { spawn, exec } = require('child_process');

// Official ngrok v3 stable Windows amd64 zip from ngrok's CDN.
const NGROK_DOWNLOAD_URL =
  'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip';

// JSON-log entry from `ngrok http ... --log stdout --log-format json`
// announces the public URL on the line that has msg="started tunnel".
const STARTED_TUNNEL_MSG = 'started tunnel';
const NGROK_URL_REGEX = /https:\/\/[a-z0-9-]+\.ngrok[a-z0-9.-]*\.app/i;

// --- Module state -----------------------------------------------------------

let logger = null;
let getMainWindow = () => null;

let tunnelProcess = null;
let tunnelStatus = 'stopped'; // stopped | starting | running | stopping | error
let tunnelUrl = null;
let tunnelError = null;
let tunnelPort = 8000;
let isInstalling = false;

// Proactive keep-alive watchdog. Pings the public tunnel URL on a short
// interval to keep the full path (edge → tunnel → upstream) warm and to
// surface tunnel failures in the logs *before* the user hits them.
//
// Two-mode polling:
//   * Healthy: probe every 20s. Quiet, low overhead, just keeps the path
//     warm so the ngrok agent's upstream connection pool doesn't go idle.
//   * Fast-recovery: when a probe fails, switch to 500ms polling. ngrok
//     almost always recovers on the very next probe, so this gives us a
//     near-instant "recovered" signal in the logs. As soon as one succeeds,
//     we drop back to 20s.
//
// Note: the fast-recovery probe is for *log visibility only* — it does not
// affect whether user requests get through. Real chat requests are protected
// by the retry-on-502 logic in main.js, which acts independently of this.
let keepAliveTimer = null;
const KEEP_ALIVE_INTERVAL_MS = 20_000;     // healthy cadence
const KEEP_ALIVE_FAST_INTERVAL_MS = 500;   // post-failure recovery cadence
let keepAliveStats = { ok: 0, fail: 0, lastError: null, lastOkAt: null };

// --- Path helpers -----------------------------------------------------------

function getBinDir() {
  return path.join(app.getPath('userData'), 'bin');
}

function getNgrokPath() {
  return path.join(getBinDir(), 'ngrok.exe');
}

function getConfigPath() {
  return path.join(app.getPath('userData'), 'tunnel-config.json');
}

function isBinaryInstalled() {
  try {
    return fs.existsSync(getNgrokPath()) && fs.statSync(getNgrokPath()).size > 0;
  } catch {
    return false;
  }
}

// --- Config persistence -----------------------------------------------------

function loadConfig() {
  try {
    if (!fs.existsSync(getConfigPath())) {
      return { enabled: false, authtoken: null };
    }
    const parsed = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'));
    return {
      enabled: !!parsed.enabled,
      authtoken: typeof parsed.authtoken === 'string' && parsed.authtoken.trim()
        ? parsed.authtoken.trim()
        : null,
    };
  } catch {
    return { enabled: false, authtoken: null };
  }
}

function saveConfig(patch) {
  try {
    const current = loadConfig();
    const next = {
      enabled: 'enabled' in patch ? !!patch.enabled : current.enabled,
      authtoken: 'authtoken' in patch
        ? (patch.authtoken && patch.authtoken.trim()) || null
        : current.authtoken,
      updatedAt: new Date().toISOString(),
    };
    const dir = path.dirname(getConfigPath());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(getConfigPath(), JSON.stringify(next, null, 2), 'utf8');
    return next;
  } catch (e) {
    if (logger) logger.logError('Failed to save tunnel config', 'TUNNEL', e);
    return null;
  }
}

function isAuthConfigured() {
  return !!loadConfig().authtoken;
}

// "ready to use" = binary on disk AND authtoken stored.
// Mapped to the `installed` flag in the renderer payload for backward compat.
function isReady() {
  return isBinaryInstalled() && isAuthConfigured();
}

// --- Renderer event helpers -------------------------------------------------

function emit(channel, data) {
  const win = typeof getMainWindow === 'function' ? getMainWindow() : null;
  if (win && !win.isDestroyed() && win.webContents) {
    try { win.webContents.send(channel, data); } catch {}
  }
}

function buildStatusPayload() {
  return {
    status: tunnelStatus,
    url: tunnelUrl,
    error: tunnelError,
    installed: isReady(),               // "ready to use" (binary + auth)
    binaryPresent: isBinaryInstalled(), // binary alone, exposed for UI
    authConfigured: isAuthConfigured(), // authtoken stored
    installing: isInstalling,
    port: tunnelPort,
  };
}

function emitTunnelStatus() {
  emit('tunnel-status', buildStatusPayload());
}

// --- Download + extract -----------------------------------------------------

function downloadFile(url, targetPath, onProgress) {
  return new Promise((resolve, reject) => {
    const tempPath = targetPath + '.download';
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }

    const fetchWithRedirects = (current, hops = 0) => {
      if (hops > 8) return reject(new Error('Too many redirects'));

      const req = https.get(current, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          res.resume();
          if (!res.headers.location) return reject(new Error('Redirect with no location'));
          return fetchWithRedirects(res.headers.location, hops + 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`Download failed (HTTP ${res.statusCode})`));
        }

        const total = parseInt(res.headers['content-length'] || '0', 10);
        let downloaded = 0;
        let lastPct = -1;

        const file = fs.createWriteStream(tempPath);
        res.on('data', (chunk) => {
          downloaded += chunk.length;
          if (total > 0) {
            const pct = Math.floor((downloaded / total) * 100);
            if (pct !== lastPct) {
              lastPct = pct;
              if (onProgress) onProgress({ phase: 'downloading', percent: pct, downloaded, total });
            }
          } else if (onProgress) {
            onProgress({ phase: 'downloading', percent: -1, downloaded, total: 0 });
          }
        });
        res.pipe(file);

        file.on('finish', () => {
          file.close((err) => {
            if (err) return reject(err);
            try {
              if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
              fs.renameSync(tempPath, targetPath);
              resolve(targetPath);
            } catch (e) { reject(e); }
          });
        });
        file.on('error', (err) => {
          try { fs.unlinkSync(tempPath); } catch {}
          reject(err);
        });
      });
      req.setTimeout(60_000, () => req.destroy(new Error('Download timed out')));
      req.on('error', (err) => {
        try { fs.unlinkSync(tempPath); } catch {}
        reject(err);
      });
    };

    fetchWithRedirects(url);
  });
}

// Use PowerShell's built-in Expand-Archive — ships with Windows 10+, no deps.
function extractZip(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command ` +
      `"Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${destDir}' -Force"`;
    exec(cmd, { windowsHide: true }, (err, _stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve();
    });
  });
}

async function downloadAndExtractNgrok() {
  const binDir = getBinDir();
  if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

  const zipPath = path.join(binDir, 'ngrok.zip');
  const targetExe = getNgrokPath();

  if (logger) {
    logger.log('Downloading ngrok', 'HEADER', 'TUNNEL');
    logger.logDetail('Source', NGROK_DOWNLOAD_URL);
    logger.logDetail('Target', targetExe);
  }

  emit('tunnel-install-progress', { phase: 'starting', percent: 0 });

  await downloadFile(NGROK_DOWNLOAD_URL, zipPath, (progress) => {
    emit('tunnel-install-progress', progress);
  });

  emit('tunnel-install-progress', { phase: 'downloading', percent: 100 });

  // The zip contains a single `ngrok.exe` at its root. Extract directly into binDir.
  await extractZip(zipPath, binDir);

  // Clean up the zip
  try { fs.unlinkSync(zipPath); } catch {}

  if (!fs.existsSync(targetExe)) {
    throw new Error('ngrok.exe not found after extraction');
  }

  emit('tunnel-install-progress', { phase: 'complete', percent: 100 });
  if (logger) logger.logSuccess('ngrok installed', 'TUNNEL');
}

// --- Setup (download + auth) ------------------------------------------------

// One combined "install" step: persist authtoken + ensure binary is on disk.
// Either step is idempotent. Called from `tunnel-install` IPC.
async function install({ authtoken } = {}) {
  if (isInstalling) return { success: false, message: 'Setup already in progress' };

  // Validate + persist authtoken if provided. We require an authtoken to be
  // configured (either now or previously) before we consider the tunnel ready.
  if (authtoken) {
    const trimmed = authtoken.trim();
    if (trimmed.length < 20) {
      return { success: false, message: 'That doesn\'t look like a valid ngrok authtoken.' };
    }
    saveConfig({ authtoken: trimmed });
    if (logger) logger.logSuccess('ngrok authtoken stored', 'TUNNEL');
  }

  if (!isAuthConfigured()) {
    return { success: false, message: 'An ngrok authtoken is required to continue.' };
  }

  // Already fully set up
  if (isBinaryInstalled()) {
    emitTunnelStatus();
    return { success: true, alreadyInstalled: true };
  }

  isInstalling = true;
  emitTunnelStatus();

  try {
    await downloadAndExtractNgrok();
    isInstalling = false;
    emitTunnelStatus();
    return { success: true };
  } catch (error) {
    isInstalling = false;
    if (logger) logger.logError('ngrok setup failed', 'TUNNEL', error);
    emit('tunnel-install-progress', { phase: 'error', error: error.message });
    emitTunnelStatus();
    return { success: false, message: error.message };
  }
}

async function uninstall() {
  try {
    await stopTunnel();
    if (fs.existsSync(getNgrokPath())) fs.unlinkSync(getNgrokPath());
    saveConfig({ authtoken: null, enabled: false });
    if (logger) logger.logSuccess('ngrok uninstalled', 'TUNNEL');
    emitTunnelStatus();
    return { success: true };
  } catch (error) {
    if (logger) logger.logError('ngrok uninstall failed', 'TUNNEL', error);
    return { success: false, message: error.message };
  }
}

// --- Port readiness probe ---------------------------------------------------
// Before marking the tunnel as running, verify the local proxy is actually
// accepting connections. ngrok returns "failed to open private leg" (502) if
// the upstream isn't ready, which looks like a tunnel problem to the caller.

function waitForPort(port, host, timeoutMs) {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const tryConnect = () => {
      const sock = require('net').createConnection({ host, port });
      sock.once('connect', () => { sock.destroy(); resolve(true); });
      sock.once('error', () => {
        sock.destroy();
        if (Date.now() < deadline) {
          setTimeout(tryConnect, 250);
        } else {
          resolve(false); // timed out — proceed anyway, don't block forever
        }
      });
    };
    tryConnect();
  });
}

// --- Tunnel lifecycle -------------------------------------------------------

// Proactively ping the public tunnel URL to keep the path warm and detect
// failures early. We hit `/health` (cheap, no AI work) and target the
// ngrok-skip-browser-warning header so ngrok-free.app interstitials don't
// confuse the result.
function pingPublicUrl(url) {
  return new Promise((resolve) => {
    const target = `${url}/health`;
    const t0 = Date.now();
    const req = https.get(target, {
      headers: {
        'User-Agent': 'spike-keepalive/1.0',
        'ngrok-skip-browser-warning': 'true',
      },
    }, (res) => {
      res.resume();
      const elapsed = Date.now() - t0;
      const status = res.statusCode || 0;
      const ok = status > 0 && status < 500;
      resolve({ ok, status, elapsed });
    });
    req.setTimeout(8000, () => req.destroy(new Error('keepalive timeout')));
    req.on('error', (err) => {
      resolve({ ok: false, status: 0, elapsed: Date.now() - t0, error: err.message });
    });
  });
}

// One-shot warmup. Hits `/v1/models` through the public tunnel which forces
// the unified proxy to construct its httpx client and open a TCP/TLS
// connection to the upstream — exactly the work that, when done lazily on
// the first real chat request, briefly stalls uvicorn's accept loop and
// causes ngrok agent's pipelined second connection to fail with "failed to
// open private leg". Doing it once here means the user's first chat request
// arrives at an already-warm proxy with already-open upstream connections.
function warmupViaTunnel(url) {
  return new Promise((resolve) => {
    const target = `${url}/v1/models`;
    const t0 = Date.now();
    const req = https.get(target, {
      headers: {
        'User-Agent': 'spike-warmup/1.0',
        'ngrok-skip-browser-warning': 'true',
      },
    }, (res) => {
      res.resume();
      resolve({ ok: res.statusCode === 200, status: res.statusCode, elapsed: Date.now() - t0 });
    });
    req.setTimeout(15000, () => req.destroy(new Error('warmup timeout')));
    req.on('error', (err) => {
      resolve({ ok: false, status: 0, elapsed: Date.now() - t0, error: err.message });
    });
  });
}

function startKeepAlive() {
  stopKeepAlive();
  if (!tunnelUrl) return;
  if (logger) logger.log(`Keep-alive started (${KEEP_ALIVE_INTERVAL_MS / 1000}s healthy / ${KEEP_ALIVE_FAST_INTERVAL_MS}ms fast-recovery)`, 'INFO', 'TUNNEL');

  let inFastRecovery = false;
  let consecutiveFastFailures = 0;
  let cancelled = false;

  // Adaptive scheduler: when healthy, poll every 20s. When a failure is
  // detected, switch to 2s polling so we re-validate the path quickly. The
  // moment a fast-recovery probe succeeds, drop back to the lazy 20s cadence.
  // This shrinks the user-visible failure window from ~19s to ~2s without
  // generating sustained noise.
  const scheduleNext = (delayMs) => {
    if (cancelled) return;
    keepAliveTimer = setTimeout(tick, delayMs);
  };

  const tick = async () => {
    if (cancelled) return;
    if (tunnelStatus !== 'running' || !tunnelUrl) {
      // Tunnel state changed under us; stop polling but leave the timer slot
      // open so a later state restoration can restart cleanly.
      return;
    }

    const result = await pingPublicUrl(tunnelUrl);

    if (result.ok) {
      keepAliveStats.ok += 1;
      keepAliveStats.lastOkAt = Date.now();
      keepAliveStats.lastError = null;

      if (inFastRecovery) {
        // We were in fast-recovery and just got a green probe — return to
        // healthy cadence and announce it.
        inFastRecovery = false;
        consecutiveFastFailures = 0;
        if (logger) {
          logger.logSuccess(
            `Keep-alive recovered (${result.status}, ${result.elapsed}ms)`,
            'TUNNEL'
          );
        }
      }
      // Otherwise, stay silent — routine success.

      scheduleNext(KEEP_ALIVE_INTERVAL_MS);
    } else {
      keepAliveStats.fail += 1;
      keepAliveStats.lastError = result.error || `HTTP ${result.status}`;

      if (!inFastRecovery) {
        // First failure in a sequence — flip into fast-recovery mode and log.
        inFastRecovery = true;
        consecutiveFastFailures = 1;
        if (logger) {
          logger.logWarning(
            `Keep-alive FAIL (${result.status || 'no-response'}, ${result.elapsed}ms) — entering fast-recovery probe`,
            'TUNNEL'
          );
        }
      } else {
        // Already probing fast — only log occasionally so we don't spam if
        // the path stays down longer than usual. At 500ms cadence, every
        // 30 failures = 15s, which is well past ngrok's normal recovery time.
        consecutiveFastFailures += 1;
        if (logger && consecutiveFastFailures % 30 === 0) {
          logger.logWarning(
            `Keep-alive still failing after ${consecutiveFastFailures} fast probes (${result.status || 'no-response'})`,
            'TUNNEL'
          );
        }
      }

      scheduleNext(KEEP_ALIVE_FAST_INTERVAL_MS);
    }
  };

  // Stash the cancel flag where stopKeepAlive can reach it via closure.
  // Using a small object so we can replace timer + cancel atomically.
  keepAliveTimer = { cancel: () => { cancelled = true; } };

  // Fire one immediately so the path is warmed up the moment the tunnel
  // becomes "running" — eliminates the "first request always fails" symptom.
  tick();
}

function stopKeepAlive() {
  if (keepAliveTimer) {
    // Support both the legacy setInterval handle and the new {cancel} object.
    if (typeof keepAliveTimer === 'object' && keepAliveTimer.cancel) {
      keepAliveTimer.cancel();
    } else {
      clearInterval(keepAliveTimer);
    }
    keepAliveTimer = null;
    if (logger) logger.log('Keep-alive stopped', 'INFO', 'TUNNEL');
  }
  keepAliveStats = { ok: 0, fail: 0, lastError: null, lastOkAt: null };
}

async function startTunnel(port) {
  if (port) tunnelPort = port;

  if (tunnelStatus === 'running' || tunnelStatus === 'starting') {
    return { success: true, message: 'Tunnel already active', url: tunnelUrl };
  }
  if (!isBinaryInstalled()) {
    return { success: false, message: 'ngrok is not installed yet' };
  }
  const cfg = loadConfig();
  if (!cfg.authtoken) {
    return { success: false, message: 'ngrok authtoken is not configured' };
  }

  tunnelStatus = 'starting';
  tunnelUrl = null;
  tunnelError = null;
  emitTunnelStatus();

  if (logger) {
    logger.log(`Starting ngrok tunnel for port ${tunnelPort}`, 'HEADER', 'TUNNEL');
    logger.logDetail('Binary', getNgrokPath());
    logger.logDetail('Target', `http://127.0.0.1:${tunnelPort}`);
  }

  try {
    // Write a minimal ngrok v3 config that sets heartbeat intervals to keep
    // the private leg alive through NAT/router idle timeouts. Without this,
    // routers drop TCP state after ~5-30 min of silence, causing the first
    // request after a long idle to 502 with "failed to open private leg".
    // In ngrok v3, heartbeat options must be nested under the `agent:` key.
    const ngrokConfigPath = path.join(getBinDir(), 'ngrok-spike.yml');
    const ngrokConfig = [
      'version: "3"',
      'agent:',
      '  # Keep the private leg alive through NAT/router idle timeouts.',
      '  # Routers evict TCP state after ~5-30 min; heartbeats prevent that.',
      '  heartbeat_interval: 10s',
      '  heartbeat_tolerance: 5s',
    ].join('\n');
    fs.writeFileSync(ngrokConfigPath, ngrokConfig, 'utf8');

    const args = [
      'http',
      // Explicit 127.0.0.1 (not "localhost" or just the port). On Windows,
      // "localhost" resolves to ::1 first; our origin services bind only to
      // IPv4, so the very first request after a tunnel start would 502 with
      // "failed to open private leg" until ngrok cached the IPv4 fallback.
      `127.0.0.1:${tunnelPort}`,
      '--config', ngrokConfigPath,
      '--log', 'stdout',
      '--log-format', 'json',
      '--log-level', 'info',
    ];

    tunnelProcess = spawn(getNgrokPath(), args, {
      windowsHide: true,
      env: { ...process.env, NGROK_AUTHTOKEN: cfg.authtoken },
    });

    const handleLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Try parsing as JSON (the normal case)
      let entry = null;
      try { entry = JSON.parse(trimmed); } catch {}

      // Capture URL the first time we see it
      if (!tunnelUrl) {
        if (entry && entry.msg === STARTED_TUNNEL_MSG && entry.url) {
          tunnelUrl = entry.url;
        } else {
          const match = trimmed.match(NGROK_URL_REGEX);
          if (match) tunnelUrl = match[0];
        }
        if (tunnelUrl) {
          // Probe the local proxy before advertising the tunnel as ready.
          // ngrok returns 502 "failed to open private leg" if the upstream
          // isn't accepting connections yet. We wait up to 10s for it.
          waitForPort(tunnelPort, '127.0.0.1', 30_000).then(async (ready) => {
            if (!ready && logger) {
              logger.logWarning(
                `Port ${tunnelPort} not ready after 30s — tunnel may 502 on first request`,
                'TUNNEL'
              );
            }
            tunnelStatus = 'running';
            if (logger) {
              logger.logSuccess('Tunnel established', 'TUNNEL');
              logger.logDetail('Public URL', tunnelUrl);
            }
            emitTunnelStatus();

            // Fire a one-shot warmup through the tunnel BEFORE starting the
            // periodic keep-alive. This forces the unified proxy to do its
            // lazy httpx setup and open upstream connections now, so the
            // user's first real chat request hits an already-warm proxy.
            // Without this, that lazy setup happens on the first request and
            // briefly stalls uvicorn, causing ngrok agent's pipelined SYN to
            // be refused with "failed to open private leg".
            const warm = await warmupViaTunnel(tunnelUrl);
            if (logger) {
              if (warm.ok) {
                logger.logSuccess(
                  `Tunnel warmup complete (${warm.status}, ${warm.elapsed}ms)`,
                  'TUNNEL'
                );
              } else {
                logger.logWarning(
                  `Tunnel warmup failed (${warm.status || 'no-response'}, ${warm.elapsed}ms) — first chat may still hit a hiccup`,
                  'TUNNEL'
                );
              }
            }

            // Now start the steady keep-alive watchdog.
            startKeepAlive();
          });
        }
      }

      // Surface ngrok-reported errors
      if (entry && entry.lvl === 'error' && entry.err) {
        if (logger) logger.logError(`ngrok: ${entry.err}`, 'TUNNEL');
        // Don't immediately flip to error — ngrok recovers from many of these
        // on its own. Hard failures will exit the process.
      }

      // Filter out routine ngrok chatter that fires on every request and
      // drowns out the interesting logs. We still log everything else.
      const NGROK_NOISE = new Set([
        'join connections',  // every successful upstream connect
        'open connection',   // verbose connection lifecycle
        'http heartbeat',    // periodic agent heartbeat
        'received tunnel acl', // routine policy refresh
      ]);
      const isNoise = entry && entry.msg && NGROK_NOISE.has(entry.msg);

      if (logger && !isNoise && trimmed.length > 5 && trimmed.length < 500) {
        const level = entry && entry.lvl === 'error' ? 'WARNING' : 'INFO';
        const msg = entry && entry.msg ? entry.msg : trimmed;
        logger.log(msg, level, 'TUNNEL');
      }
    };

    let stdoutBuf = '';
    let stderrBuf = '';
    const onChunk = (which) => (data) => {
      const text = data.toString();
      const buf = which === 'out' ? (stdoutBuf += text) : (stderrBuf += text);
      const lines = buf.split(/\r?\n/);
      const tail = lines.pop(); // last partial line stays buffered
      if (which === 'out') stdoutBuf = tail; else stderrBuf = tail;
      lines.forEach(handleLine);
    };
    tunnelProcess.stdout.on('data', onChunk('out'));
    tunnelProcess.stderr.on('data', onChunk('err'));

    tunnelProcess.on('close', (code) => {
      const wasStopping = tunnelStatus === 'stopping';
      const exitedDuringStart = tunnelStatus === 'starting';
      const cleanExit = code === 0 || code === null;

      if (logger) {
        logger.log(`ngrok exited with code ${code}`, cleanExit ? 'INFO' : 'ERROR', 'TUNNEL');
      }

      // Stop the keep-alive — it has nothing to ping anymore.
      stopKeepAlive();

      tunnelProcess = null;
      tunnelUrl = null;

      if (wasStopping) {
        tunnelStatus = 'stopped';
        tunnelError = null;
        emitTunnelStatus();
      } else if (exitedDuringStart || !cleanExit) {
        tunnelStatus = 'error';
        tunnelError = describeExitCode(code);
        emitTunnelStatus();
      } else {
        // Unexpected clean exit while running — auto-reconnect after a short
        // delay. This covers the case where the private leg was silently
        // dropped and ngrok gave up rather than reconnecting.
        tunnelStatus = 'starting';
        tunnelError = null;
        emitTunnelStatus();
        if (logger) logger.log('ngrok exited unexpectedly — reconnecting in 2s…', 'WARNING', 'TUNNEL');
        setTimeout(() => {
          if (tunnelStatus === 'starting') startTunnel(tunnelPort);
        }, 2000);
      }
    });

    tunnelProcess.on('error', (err) => {
      if (logger) logger.logError('ngrok process error', 'TUNNEL', err);
      stopKeepAlive();
      tunnelStatus = 'error';
      tunnelError = err.message;
      tunnelProcess = null;
      tunnelUrl = null;
      emitTunnelStatus();
    });

    return { success: true };
  } catch (error) {
    tunnelStatus = 'error';
    tunnelError = error.message;
    tunnelProcess = null;
    emitTunnelStatus();
    if (logger) logger.logError('Failed to start tunnel', 'TUNNEL', error);
    return { success: false, message: error.message };
  }
}

function describeExitCode(code) {
  // ngrok exits with 1 on auth failures and most fatal errors. The detailed
  // reason is in the JSON log, which we already surfaced. Keep this short.
  if (code === null || code === 0) return null;
  return `ngrok exited with code ${code} — check the log for details.`;
}

async function stopTunnel() {
  if (!tunnelProcess && tunnelStatus !== 'running' && tunnelStatus !== 'starting') {
    stopKeepAlive();
    tunnelStatus = 'stopped';
    tunnelUrl = null;
    tunnelError = null;
    emitTunnelStatus();
    return { success: true };
  }

  stopKeepAlive();
  tunnelStatus = 'stopping';
  emitTunnelStatus();

  const proc = tunnelProcess;
  await new Promise((resolve) => {
    if (!proc) return resolve();
    if (process.platform === 'win32' && proc.pid) {
      exec(`taskkill /F /T /PID ${proc.pid}`, () => resolve());
    } else {
      try { proc.kill('SIGTERM'); } catch {}
      resolve();
    }
  });

  // Belt-and-braces: if the 'close' handler is slow to land, force-finalize.
  setTimeout(() => {
    if (tunnelStatus === 'stopping') {
      tunnelStatus = 'stopped';
      tunnelUrl = null;
      tunnelError = null;
      tunnelProcess = null;
      emitTunnelStatus();
    }
  }, 1500);

  return { success: true };
}

function getStatus() {
  return buildStatusPayload();
}

async function maybeAutoStart(port) {
  const cfg = loadConfig();
  if (cfg.enabled && isReady()) {
    if (logger) logger.log('Auto-starting tunnel from saved config', 'INFO', 'TUNNEL');
    return startTunnel(port);
  }
  return { success: false, message: 'Auto-start skipped' };
}

function resetEnabled() {
  saveConfig({ enabled: false });
}

// --- IPC registration -------------------------------------------------------

function registerTunnelHandlers(loggerImpl, mainWindowGetter, ensureProxyRunning) {
  logger = loggerImpl;
  if (typeof mainWindowGetter === 'function') getMainWindow = mainWindowGetter;

  // Channels are intentionally generic ("tunnel-*") — implementation detail
  // (cloudflared / ngrok / future) lives behind this contract.
  ipcMain.handle('tunnel-install', async (_e, payload) => install(payload || {}));
  ipcMain.handle('tunnel-uninstall', async () => uninstall());
  ipcMain.handle('tunnel-start', async (_e, port) => {
    // Ensure the proxy is running before starting the tunnel. The tunnel is
    // useless without it, and ngrok returns 502 "failed to open private leg"
    // if the upstream isn't accepting connections.
    if (typeof ensureProxyRunning === 'function') {
      if (logger) logger.log('Ensuring proxy is running before starting tunnel…', 'INFO', 'TUNNEL');
      await ensureProxyRunning();
      // The port probe in startTunnel will wait for the port to be ready,
      // so we don't need to block here — just kick off the proxy start.
    }
    return startTunnel(port || 8000);
  });
  ipcMain.handle('tunnel-stop', async () => stopTunnel());
  ipcMain.handle('tunnel-get-status', async () => getStatus());
  ipcMain.handle('tunnel-save-config', async (_e, cfg) => {
    const saved = saveConfig(cfg || {});
    return { success: !!saved };
  });
  ipcMain.handle('tunnel-get-config', async () => {
    const c = loadConfig();
    // Don't leak the authtoken to the renderer — only whether one is set.
    return { enabled: c.enabled, authConfigured: !!c.authtoken };
  });
}

module.exports = {
  registerTunnelHandlers,
  stopTunnel,
  maybeAutoStart,
  getStatus,
  isReady,
  resetEnabled,
};
