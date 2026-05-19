"""
Smoke test for the Spike Cloudflare tunnel endpoint.

Verifies that a publicly-exposed Spike instance (via the in-app Cloudflare tunnel)
serves the OpenAI-compatible chat-completions API correctly.

Usage:
    # Default test against your current tunnel URL:
    python test_tunnel_endpoint.py

    # Override the URL:
    python test_tunnel_endpoint.py --url https://something-else.trycloudflare.com/v1

    # Pick a different model:
    python test_tunnel_endpoint.py --model gemini-3-flash
    python test_tunnel_endpoint.py --model gpt-4o-mini

    # Run against the local instance instead:
    python test_tunnel_endpoint.py --url http://localhost:8000/v1

Requires:
    pip install requests
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from typing import Any

import requests


# --- Defaults ----------------------------------------------------------------

DEFAULT_BASE_URL = "https://brian-holiday-cio-escape.trycloudflare.com/v1"
DEFAULT_MODEL = "gemini-2.0-flash"
DEFAULT_TIMEOUT = 90  # Gemini/ChatGPT bridges can be slow to first-token.
DEFAULT_AUTH_HEADER = "Bearer nexusai-default-auth-key"


# --- Pretty output -----------------------------------------------------------

def _print_header(label: str) -> None:
    print()
    print("=" * 72)
    print(f"  {label}")
    print("=" * 72)


def _ok(msg: str) -> None:
    print(f"  [PASS] {msg}")


def _fail(msg: str) -> None:
    print(f"  [FAIL] {msg}")


def _info(msg: str) -> None:
    print(f"         {msg}")


# --- Test helpers ------------------------------------------------------------

def _post_chat_completion(
    base_url: str,
    model: str,
    user_message: str,
    timeout: int,
    auth_header: str,
) -> tuple[bool, dict[str, Any] | str, float]:
    """POST to /chat/completions and return (success, body_or_error, elapsed_s)."""
    url = f"{base_url.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": auth_header,
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": user_message}],
    }

    start = time.perf_counter()
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
    except requests.RequestException as exc:
        elapsed = time.perf_counter() - start
        return False, f"Request error: {exc}", elapsed

    elapsed = time.perf_counter() - start

    if resp.status_code != 200:
        body_preview = resp.text[:500] if resp.text else "<empty body>"
        return False, f"HTTP {resp.status_code}: {body_preview}", elapsed

    try:
        data = resp.json()
    except json.JSONDecodeError as exc:
        return False, f"Response was not JSON: {exc}; body: {resp.text[:500]}", elapsed

    return True, data, elapsed


# --- Individual tests --------------------------------------------------------

def test_reachability(base_url: str, timeout: int) -> bool:
    """Confirm the tunnel host is reachable at all (even a 404 is fine)."""
    _print_header("Test 1 - Endpoint reachability")
    _info(f"Base URL: {base_url}")
    try:
        # Hit the API root; we just want to prove the host responds.
        resp = requests.get(base_url.rstrip("/"), timeout=timeout)
        _ok(f"Host responded with HTTP {resp.status_code}")
        return True
    except requests.RequestException as exc:
        _fail(f"Could not reach host: {exc}")
        return False


def test_chat_completion(
    base_url: str,
    model: str,
    timeout: int,
    auth_header: str,
) -> bool:
    """Run the full /v1/chat/completions request and validate the response shape."""
    _print_header("Test 2 - /chat/completions round-trip")
    _info(f"Model: {model}")
    _info("Prompt: 'Reply with exactly the word: pong'")

    ok, body, elapsed = _post_chat_completion(
        base_url=base_url,
        model=model,
        user_message="Reply with exactly the word: pong",
        timeout=timeout,
        auth_header=auth_header,
    )

    _info(f"Elapsed: {elapsed:.2f}s")

    if not ok:
        _fail(str(body))
        return False

    assert isinstance(body, dict)

    # Validate OpenAI-compatible shape
    if "choices" not in body or not body["choices"]:
        _fail("Response missing 'choices' array")
        _info(f"Body: {json.dumps(body)[:500]}")
        return False

    first = body["choices"][0]
    message = (first or {}).get("message") or {}
    content = message.get("content")

    if not isinstance(content, str) or not content.strip():
        _fail("Response had no usable assistant content")
        _info(f"Body: {json.dumps(body)[:500]}")
        return False

    _ok("HTTP 200 with OpenAI-compatible response shape")
    _ok(f"Assistant content present ({len(content)} chars)")
    _info(f"Reply preview: {content.strip()[:200]!r}")

    # Some providers include usage stats; report if available.
    usage = body.get("usage")
    if isinstance(usage, dict):
        _info(
            "Usage: prompt_tokens={p}, completion_tokens={c}, total_tokens={t}".format(
                p=usage.get("prompt_tokens", "?"),
                c=usage.get("completion_tokens", "?"),
                t=usage.get("total_tokens", "?"),
            )
        )

    return True


def test_unknown_model_handling(base_url: str, timeout: int, auth_header: str) -> bool:
    """Probe how the proxy handles a bogus model name.

    Note: this is informational. The unified proxy currently falls back to a
    default backend for unknown model names rather than rejecting the request,
    so a 200 here doesn't indicate a tunnel problem - just a routing choice in
    the proxy itself. We pass either way and only report what we observed.
    """
    _print_header("Test 3 - Unknown-model handling (informational)")
    bogus = "this-model-does-not-exist-xyz"
    _info(f"Model: {bogus}")

    ok, body, elapsed = _post_chat_completion(
        base_url=base_url,
        model=bogus,
        user_message="hi",
        timeout=timeout,
        auth_header=auth_header,
    )
    _info(f"Elapsed: {elapsed:.2f}s")

    if not ok:
        _ok(f"Server rejected unknown model: {str(body)[:160]}")
        return True

    # Returned 200: not a tunnel issue, but worth flagging.
    _ok("Server returned 200 - proxy fell back to its default backend")
    _info("This is a server-side routing choice in unified_proxy_standalone.py,")
    _info("not a tunnel problem. Tighten there if you want strict rejection.")
    return True


# --- Entry point -------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--url",
        default=DEFAULT_BASE_URL,
        help=f"Base API URL ending in /v1 (default: {DEFAULT_BASE_URL})",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Model to test (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
        help=f"Per-request timeout in seconds (default: {DEFAULT_TIMEOUT})",
    )
    parser.add_argument(
        "--auth",
        default=DEFAULT_AUTH_HEADER,
        help="Authorization header value (default: bearer nexusai-default-auth-key)",
    )
    parser.add_argument(
        "--skip-unknown-model",
        action="store_true",
        help="Skip the unknown-model rejection test",
    )
    args = parser.parse_args()

    print()
    print("Spike tunnel endpoint smoke test")
    print(f"Target: {args.url}")
    print(f"Model:  {args.model}")

    results: list[tuple[str, bool]] = []

    results.append(("reachability", test_reachability(args.url, args.timeout)))
    results.append((
        "chat_completion",
        test_chat_completion(args.url, args.model, args.timeout, args.auth),
    ))
    if not args.skip_unknown_model:
        results.append((
            "unknown_model_handling",
            test_unknown_model_handling(args.url, args.timeout, args.auth),
        ))

    _print_header("Summary")
    passed = sum(1 for _, ok in results if ok)
    total = len(results)
    for name, ok in results:
        status = "PASS" if ok else "FAIL"
        print(f"  [{status}] {name}")
    print()
    print(f"  {passed}/{total} tests passed")
    print()

    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
