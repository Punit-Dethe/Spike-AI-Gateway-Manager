/**
 * Drop-in chat client with automatic retry on transient ngrok 502s.
 *
 * When you call your Spike public URL through an ngrok tunnel, you may
 * occasionally get an HTTP 502 with an HTML body containing the text
 * "failed to open private leg". This is a transient ngrok agent error that
 * resolves itself on the very next request — usually within a few hundred
 * milliseconds.
 *
 * This module wraps a normal chat-completion call so that error is detected
 * and retried automatically. Real backend errors (auth, model errors, etc.)
 * pass through unchanged.
 *
 * Works in Node 18+ (built-in fetch) and in modern browsers.
 *
 * Usage:
 *
 *   const { chat } = require('./chatWithRetry');
 *
 *   const answer = await chat('Explain quantum computing', {
 *     baseUrl: 'https://your-name.ngrok-free.app',
 *     model: 'gemini-2.0-flash',
 *   });
 *   console.log(answer);
 *
 * Or the lower-level helper:
 *
 *   const { postChatCompletion } = require('./chatWithRetry');
 *
 *   const response = await postChatCompletion({
 *     baseUrl: 'https://your-name.ngrok-free.app',
 *     payload: {
 *       model: 'gemini-2.0-flash',
 *       messages: [{ role: 'user', content: 'Hello' }],
 *     },
 *   });
 */

// How many extra attempts to make on transient ngrok 502s.
// The error returns near-instantly, so retries are essentially free.
const MAX_RETRIES = 3;

// Pause between attempts. Short — ngrok recovers almost immediately.
const RETRY_BACKOFF_MS = 250;

// Per-attempt timeout. Generous because real Gemini calls can take
// several seconds; we don't want to mistake a slow real request for
// a transient failure.
const REQUEST_TIMEOUT_MS = 60_000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Identify the ngrok "failed to open private leg" 502 page so we only
// retry that specific transient error, not real backend failures.
function isTransientNgrokError(status, body) {
  if (status !== 502) return false;
  if (typeof body !== 'string' || !body) return false;
  const lower = body.toLowerCase();
  return (
    lower.includes('ngrok') &&
    (lower.includes('private leg') ||
      lower.includes('err_ngrok') ||
      lower.includes('<!doctype html'))
  );
}

async function postChatCompletion({
  baseUrl,
  payload,
  authHeader,
  maxRetries = MAX_RETRIES,
  backoffMs = RETRY_BACKOFF_MS,
  timeoutMs = REQUEST_TIMEOUT_MS,
}) {
  const url = `${baseUrl.replace(/\/$/, '')}/v1/chat/completions`;
  const headers = {
    'Content-Type': 'application/json',
    // Skip the ngrok-free interstitial so callers always get JSON back.
    'ngrok-skip-browser-warning': 'true',
  };
  if (authHeader) headers.Authorization = authHeader;

  const body = JSON.stringify(payload);

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      // Network-level failure — surface it; only HTTP 502 is retried here.
      throw err;
    }
    clearTimeout(timer);

    if (response.ok) {
      return await response.json();
    }

    const text = await response.text();

    if (!isTransientNgrokError(response.status, text)) {
      // Real failure — propagate with status + a snippet of the body.
      const error = new Error(
        `HTTP ${response.status}: ${text.slice(0, 500)}`
      );
      error.status = response.status;
      error.body = text;
      throw error;
    }

    lastError = new Error(
      `Transient ngrok 502 (attempt ${attempt + 1}/${maxRetries + 1})`
    );
    lastError.status = response.status;
    lastError.body = text;

    if (attempt < maxRetries) {
      await delay(backoffMs);
    }
  }

  throw lastError;
}

async function chat(
  message,
  { baseUrl, model = 'gemini-2.0-flash', authHeader } = {}
) {
  const response = await postChatCompletion({
    baseUrl,
    authHeader,
    payload: {
      model,
      messages: [{ role: 'user', content: message }],
    },
  });
  return response.choices[0].message.content;
}

module.exports = {
  chat,
  postChatCompletion,
  isTransientNgrokError,
};

// Demo when run directly:
//   node chatWithRetry.js https://your-name.ngrok-free.app
if (require.main === module) {
  const tunnelUrl = process.argv[2];
  if (!tunnelUrl) {
    console.error('Usage: node chatWithRetry.js <tunnel_url>');
    process.exit(1);
  }
  chat("Say 'ok' and nothing else.", { baseUrl: tunnelUrl })
    .then((reply) => console.log(`Reply: ${reply}`))
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
