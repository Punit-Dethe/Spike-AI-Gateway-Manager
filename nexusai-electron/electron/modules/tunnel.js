/**
 * Cloudflare Tunnel Module
 *
 * Provides one-click "quick tunnel" support for the Unified Proxy (port 8000).
 *
 * Design notes:
 *  - cloudflared.exe is NOT bundled with the installer. Users click "Install" in the
 *    UI and the binary is downloaded on-demand from the official GitHub release into
 *    `userData/bin/cloudflared.exe`. This keeps the installer small and gives users
 *    who never enable the tunnel a smaller footprint.
 *  - Only quick tunnels are used (`cloudflared tunnel --url http://localhost:PORT`).
 *    Named/persistent tunnels are intentionally unsupported here.
 *  - Only the unified proxy (port 8000) is tunneled. Other services stay local.
 *  - State is persisted in `userData/tunnel-config.json` ({ enabled: bool }).
 *    On app launch, if `enabled` is true and the binary is installed, the tunnel
 *    is started automatically.
 */

const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { spawn, exec } = require('child_process');

const CLOUDFLARED_DOWNLOAD_URL =
  'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe';

const TRYCLOUDFLARE_REGEX = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

// --- Module state -----------------------------------------------------------

let logger = null;
let getMainWindow = () => null;

let tunnelProcess = null;
let tunnelStatus = 'stopped'; // stopped | starting | running | stopping | error
let tunnelUrl = null;
let tunnelError = null;
let tunnelPort = 8000;
let isInstalling = false;

// --- Path helpers -----------------------------------------------------------

function getBinDir() {
  return path.join(app.getPath('userData'), 'bin');
}

function getCloudflaredPath() {
  return path.join(getBinDir(), 'cloudflared.exe');
}

function getConfigPath() {
  return path.join(app.getPath('userData'), 'tunnel-config.json');
}

function isCloudflaredInstalled() {
  try {
    return fs.existsSync(getCloudflaredPath()) &&
      fs.statSync(getCloudflaredPath()).size > 0;
  } catch (e) {
    return false;
  }
}

// --- Config persistence -----------------------------------------------------

function loadConfig() {
  try {
    if (!fs.existsSync(getConfigPath())) {
      return { enabled: false };
    }
    const raw = fs.readFileSync(getConfigPath(), 'utf8');
    const parsed = JSON.parse(raw);
    return { enabled: !!parsed.enabled };
  } catch (e) {
    return { enabled: false };
  }
}

function saveConfig(cfg) {
  try {
    const dir = path.dirname(getConfigPath());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      getConfigPath(),
      JSON.stringify({ enabled: !!cfg.enabled, updatedAt: new Date().toISOString() }, null, 2),
      'utf8'
    );
    return true;
  } catch (e) {
    if (logger) logger.logError('Failed to save tunnel config', 'TUNNEL', e);
    return false;
  }
}

// --- Renderer event helpers -------------------------------------------------

function emit(channel, data) {
  const win = typeof getMainWindow === 'function' ? getMainWindow() : null;
  if (win && !win.isDestroyed() && win.webContents) {
    try {
      win.webContents.send(channel, data);
    } catch (e) {
      // window destroyed mid-send
    }
  }
}

function buildStatusPayload() {
  return {
    status: tunnelStatus,
    url: tunnelUrl,
    error: tunnelError,
    installed: isCloudflaredInstalled(),
    installing: isInstalling,
    port: tunnelPort,
  };
}

function emitTunnelStatus() {
  emit('tunnel-status', buildStatusPayload());
}

// --- Cloudflared download ---------------------------------------------------

function downloadCloudflared() {
  return new Promise((resolve, reject) => {
    const binDir = getBinDir();
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    const targetPath = getCloudflaredPath();
    const tempPath = targetPath + '.download';

    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (e) { /* ignore */ }
    }

    if (logger) {
      logger.log('Downloading cloudflared', 'HEADER', 'TUNNEL');
      logger.logDetail('Source', CLOUDFLARED_DOWNLOAD_URL);
      logger.logDetail('Target', targetPath);
    }

    emit('cloudflared-install-progress', { phase: 'starting', percent: 0 });

    const fetchWithRedirects = (url, redirectCount = 0) => {
      if (redirectCount > 8) {
        return reject(new Error('Too many redirects while downloading cloudflared'));
      }

      const req = https.get(url, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const next = res.headers.location;
          res.resume();
          if (!next) return reject(new Error('Redirect with no Location header'));
          return fetchWithRedirects(next, redirectCount + 1);
        }

        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`Download failed (HTTP ${res.statusCode})`));
        }

        const total = parseInt(res.headers['content-length'] || '0', 10);
        let downloaded = 0;
        let lastEmittedPercent = -1;

        const file = fs.createWriteStream(tempPath);

        res.on('data', (chunk) => {
          downloaded += chunk.length;
          if (total > 0) {
            const percent = Math.floor((downloaded / total) * 100);
            if (percent !== lastEmittedPercent) {
              lastEmittedPercent = percent;
              emit('cloudflared-install-progress', {
                phase: 'downloading',
                percent,
                downloaded,
                total,
              });
            }
          } else {
            // No content-length: emit periodic raw byte updates
            emit('cloudflared-install-progress', {
              phase: 'downloading',
              percent: -1,
              downloaded,
              total: 0,
            });
          }
        });

        res.pipe(file);

        file.on('finish', () => {
          file.close((closeErr) => {
            if (closeErr) return reject(closeErr);
            try {
              if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
              fs.renameSync(tempPath, targetPath);
              emit('cloudflared-install-progress', { phase: 'complete', percent: 100 });
              if (logger) logger.logSuccess('cloudflared installed', 'TUNNEL');
              resolve(targetPath);
            } catch (renameErr) {
              reject(renameErr);
            }
          });
        });

        file.on('error', (err) => {
          try { fs.unlinkSync(tempPath); } catch (e) { /* ignore */ }
          reject(err);
        });
      });

      req.setTimeout(60_000, () => {
        req.destroy(new Error('Download timed out'));
      });

      req.on('error', (err) => {
        try { fs.unlinkSync(tempPath); } catch (e) { /* ignore */ }
        reject(err);
      });
    };

    fetchWithRedirects(CLOUDFLARED_DOWNLOAD_URL);
  });
}

async function installCloudflared() {
  if (isInstalling) {
    return { success: false, message: 'Install already in progress' };
  }

  if (isCloudflaredInstalled()) {
    return { success: true, alreadyInstalled: true };
  }

  isInstalling = true;
  emitTunnelStatus();

  try {
    await downloadCloudflared();
    isInstalling = false;
    emitTunnelStatus();
    return { success: true };
  } catch (error) {
    isInstalling = false;
    if (logger) logger.logError('Failed to install cloudflared', 'TUNNEL', error);
    emit('cloudflared-install-progress', { phase: 'error', error: error.message });
    emitTunnelStatus();
    return { success: false, message: error.message };
  }
}

async function uninstallCloudflared() {
  try {
    await stopTunnel();
    if (fs.existsSync(getCloudflaredPath())) {
      fs.unlinkSync(getCloudflaredPath());
    }
    if (logger) logger.logSuccess('cloudflared uninstalled', 'TUNNEL');
    emitTunnelStatus();
    return { success: true };
  } catch (error) {
    if (logger) logger.logError('Failed to uninstall cloudflared', 'TUNNEL', error);
    return { success: false, message: error.message };
  }
}

// --- Tunnel lifecycle -------------------------------------------------------

async function startTunnel(port) {
  if (port) tunnelPort = port;

  if (tunnelStatus === 'running' || tunnelStatus === 'starting') {
    return { success: true, message: 'Tunnel already active', url: tunnelUrl };
  }

  if (!isCloudflaredInstalled()) {
    return { success: false, message: 'cloudflared is not installed' };
  }

  tunnelStatus = 'starting';
  tunnelUrl = null;
  tunnelError = null;
  emitTunnelStatus();

  if (logger) {
    logger.log(`Starting Cloudflare tunnel for port ${tunnelPort}`, 'HEADER', 'TUNNEL');
    logger.logDetail('Binary', getCloudflaredPath());
    logger.logDetail('Target', `http://localhost:${tunnelPort}`);
  }

  try {
    const args = [
      'tunnel',
      '--url', `http://localhost:${tunnelPort}`,
      '--no-autoupdate',
    ];

    tunnelProcess = spawn(getCloudflaredPath(), args, {
      windowsHide: true,
    });

    const handleOutput = (data) => {
      const text = data.toString();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());

      for (const line of lines) {
        const trimmed = line.trim();

        // Capture the trycloudflare URL the first time we see it
        if (!tunnelUrl) {
          const match = trimmed.match(TRYCLOUDFLARE_REGEX);
          if (match) {
            tunnelUrl = match[0];
            tunnelStatus = 'running';
            if (logger) {
              logger.logSuccess('Tunnel established', 'TUNNEL');
              logger.logDetail('Public URL', tunnelUrl);
            }
            emitTunnelStatus();
          }
        }

        if (logger && trimmed.length > 5 && trimmed.length < 500) {
          logger.log(trimmed, 'INFO', 'TUNNEL');
        }
      }
    };

    tunnelProcess.stdout.on('data', handleOutput);
    tunnelProcess.stderr.on('data', handleOutput);

    tunnelProcess.on('close', (code) => {
      const wasStopping = tunnelStatus === 'stopping';
      const exitedDuringStart = tunnelStatus === 'starting';
      const cleanExit = code === 0 || code === null;

      if (logger) {
        logger.log(
          `cloudflared exited with code ${code}`,
          cleanExit ? 'INFO' : 'ERROR',
          'TUNNEL'
        );
      }

      tunnelProcess = null;
      tunnelUrl = null;

      if (wasStopping) {
        tunnelStatus = 'stopped';
        tunnelError = null;
      } else if (exitedDuringStart || !cleanExit) {
        tunnelStatus = 'error';
        tunnelError = `cloudflared exited unexpectedly (code ${code})`;
      } else {
        tunnelStatus = 'stopped';
        tunnelError = null;
      }

      emitTunnelStatus();
    });

    tunnelProcess.on('error', (err) => {
      if (logger) logger.logError('cloudflared process error', 'TUNNEL', err);
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

async function stopTunnel() {
  if (!tunnelProcess && tunnelStatus !== 'running' && tunnelStatus !== 'starting') {
    tunnelStatus = 'stopped';
    tunnelUrl = null;
    tunnelError = null;
    emitTunnelStatus();
    return { success: true };
  }

  tunnelStatus = 'stopping';
  emitTunnelStatus();

  const proc = tunnelProcess;

  await new Promise((resolve) => {
    if (!proc) return resolve();

    if (process.platform === 'win32' && proc.pid) {
      exec(`taskkill /F /T /PID ${proc.pid}`, () => resolve());
    } else {
      try { proc.kill('SIGTERM'); } catch (e) { /* ignore */ }
      resolve();
    }
  });

  // The 'close' handler will finalize state; force-set if it didn't fire promptly.
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
  if (cfg.enabled && isCloudflaredInstalled()) {
    if (logger) logger.log('Auto-starting tunnel from saved config', 'INFO', 'TUNNEL');
    return startTunnel(port);
  }
  return { success: false, message: 'Auto-start skipped' };
}

// --- IPC registration -------------------------------------------------------

function registerTunnelHandlers(loggerImpl, mainWindowGetter) {
  logger = loggerImpl;
  if (typeof mainWindowGetter === 'function') {
    getMainWindow = mainWindowGetter;
  }

  ipcMain.handle('tunnel-install', async () => installCloudflared());
  ipcMain.handle('tunnel-uninstall', async () => uninstallCloudflared());
  ipcMain.handle('tunnel-start', async (_event, port) => startTunnel(port || 8000));
  ipcMain.handle('tunnel-stop', async () => stopTunnel());
  ipcMain.handle('tunnel-get-status', async () => getStatus());
  ipcMain.handle('tunnel-save-config', async (_event, cfg) => {
    const ok = saveConfig(cfg || {});
    return { success: ok };
  });
  ipcMain.handle('tunnel-get-config', async () => loadConfig());
}

module.exports = {
  registerTunnelHandlers,
  stopTunnel,
  maybeAutoStart,
  getStatus,
  isCloudflaredInstalled,
};
