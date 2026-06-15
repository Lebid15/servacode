"""
=====================================================
Smoke Health Check
يفحص السيرفر المحلي بعد تشغيله
=====================================================

تشغيل:
python scripts/smoke_health.py --base-url http://127.0.0.1:8000
"""

from __future__ import annotations

import argparse
import json
from urllib.request import urlopen


def read_json(url: str) -> dict:
    """
    قراءة JSON من رابط.
    """
    with urlopen(url, timeout=10) as response:  # noqa: S310
        return json.loads(response.read().decode("utf-8"))


def main() -> None:
    """
    تشغيل smoke checks.
    """
    parser = argparse.ArgumentParser(description="Run basic health smoke checks.")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    args = parser.parse_args()

    urls = [
        f"{args.base_url}/",
        f"{args.base_url}/api/v1/health",
        f"{args.base_url}/api/v1/health/live",
        f"{args.base_url}/api/v1/health/ready",
    ]

    for url in urls:
        payload = read_json(url)
        assert payload.get("success") is True
        print(f"OK: {url}")

    print("Smoke health checks passed.")


if __name__ == "__main__":
    main()
