"""
Drop-in chat client with automatic retry on transient ngrok 502s.

When you call your Spike public URL through an ngrok tunnel, you may
occasionally get an HTTP 502 with an HTML body containing the text
"failed to open private leg". This is a transient ngrok agent error that
resolves itself on the very next request — usually within a few hundred
milliseconds.

This module wraps a normal chat-completion call so that error is detected
and retried automatically. Real backend errors (auth, model errors, etc.)
pass through unchanged.

Usage:

    from chat_with_retry import chat

    answer = chat(
        message="Explain quantum computing",
        base_url="https://your-name.ngrok-free.app",
        model="gemini-2.0-flash",
    )
    print(answer)

You can also use the lower-level helper directly:

    from chat_with_retry import post_chat_completion

    response = post_chat_completion(
        base_url="https://your-name.ngrok-free.app",
        payload={
            "model": "gemini-2.0-flash",
            "messages": [{"role": "user", "content": "Hello"}],
        },
    )
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from typing import Any


# How many extra attempts to make if we get a transient ngrok 502.
# The error returns near-instantly, so even three retries cost
# < 1 second of extra latency in the worst case.
MAX_RETRIES = 3

# Pause between attempts. Short — ngrok recovers almost immediately.
RETRY_BACKOFF_SECONDS = 0.25

# Per-attempt timeout. Generous because real Gemini calls can take
# several seconds; we don't want to mistake a slow real request for
# a transient failure.
REQUEST_TIMEOUT_SECONDS = 60


def _is_transient_ngrok_error(http_error: urllib.error.HTTPError, body: str) -> bool:
    """Identify the ngrok 'failed to open private leg' 502 page.

    We only want to retry that specific transient error; any other 502 or
    error code is a real failure and should propagate to the caller.
    """
    if http_error.code != 502:
        return False
    if not body:
        return False
    body_lower = body.lower()
    return "ngrok" in body_lower and (
        "private leg" in body_lower
        or "err_ngrok" in body_lower
        or "<!doctype html" in body_lower
    )


def post_chat_completion(
    base_url: str,
    payload: dict[str, Any],
    *,
    auth_header: str | None = None,
    max_retries: int = MAX_RETRIES,
    backoff_seconds: float = RETRY_BACKOFF_SECONDS,
    timeout_seconds: float = REQUEST_TIMEOUT_SECONDS,
) -> dict[str, Any]:
    """POST to /v1/chat/completions with auto-retry on transient ngrok 502s.

    Returns the parsed JSON response on success.
    Raises the original `urllib.error.HTTPError` on the final failure.
    """
    url = f"{base_url.rstrip('/')}/v1/chat/completions"
    body_bytes = json.dumps(payload).encode()

    headers = {
        "Content-Type": "application/json",
        # Skip the ngrok-free interstitial so callers always get JSON back.
        "ngrok-skip-browser-warning": "true",
    }
    if auth_header:
        headers["Authorization"] = auth_header

    last_error: urllib.error.HTTPError | None = None

    for attempt in range(max_retries + 1):
        request = urllib.request.Request(
            url, data=body_bytes, headers=headers, method="POST"
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
                return json.loads(response.read())
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode(errors="replace")
            last_error = exc

            if not _is_transient_ngrok_error(exc, error_body):
                # Real failure — surface it with the body attached.
                exc.msg = f"{exc.msg}: {error_body[:500]}"
                raise

            if attempt >= max_retries:
                exc.msg = (
                    f"Transient ngrok 502 after {max_retries + 1} attempts. "
                    f"Original body: {error_body[:300]}"
                )
                raise

            time.sleep(backoff_seconds)

    # Unreachable in practice — the loop either returns or raises.
    if last_error is not None:
        raise last_error
    raise RuntimeError("post_chat_completion exited without a result")


def chat(
    message: str,
    *,
    base_url: str,
    model: str = "gemini-2.0-flash",
    auth_header: str | None = None,
) -> str:
    """High-level helper: send one message, return the assistant's text."""
    response = post_chat_completion(
        base_url=base_url,
        payload={
            "model": model,
            "messages": [{"role": "user", "content": message}],
        },
        auth_header=auth_header,
    )
    return response["choices"][0]["message"]["content"]


if __name__ == "__main__":
    # Demo. Pass your tunnel URL on the command line:
    #     python chat_with_retry.py https://your-name.ngrok-free.app
    import sys

    if len(sys.argv) < 2:
        print("Usage: python chat_with_retry.py <tunnel_url>")
        sys.exit(1)

    tunnel_url = sys.argv[1]
    reply = chat(
        "Say 'ok' and nothing else.",
        base_url=tunnel_url,
    )
    print(f"Reply: {reply}")
