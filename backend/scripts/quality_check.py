"""
=====================================================
Quality Check
يشغل فحوصات الجودة الأساسية للباكند من مكان واحد
=====================================================
"""

from __future__ import annotations

import argparse
import compileall
import subprocess
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]


def run_command(command: list[str], required: bool = True) -> int:
    """
    تشغيل أمر وإرجاع كود الخروج.
    """
    print(f"\n$ {' '.join(command)}")
    result = subprocess.run(command, cwd=BACKEND_ROOT, check=False)

    if required and result.returncode != 0:
        raise SystemExit(result.returncode)

    return result.returncode


def main() -> None:
    """
    تنفيذ فحص الجودة.
    """
    parser = argparse.ArgumentParser(description="Run backend quality checks.")
    parser.add_argument("--skip-pytest", action="store_true", help="تجاوز اختبارات pytest")
    parser.add_argument("--skip-ruff", action="store_true", help="تجاوز ruff")
    args = parser.parse_args()

    print("Running compileall...")
    ok = compileall.compile_dir(BACKEND_ROOT / "config", quiet=1)
    ok = compileall.compile_dir(BACKEND_ROOT / "platform_api", quiet=1) and ok
    ok = compileall.compile_dir(BACKEND_ROOT / "scripts", quiet=1) and ok
    ok = compileall.compile_dir(BACKEND_ROOT / "tests", quiet=1) and ok

    if not ok:
        raise SystemExit(1)

    if not args.skip_ruff:
        run_command([sys.executable, "-m", "ruff", "check", "config", "platform_api", "scripts", "tests"])

    if not args.skip_pytest:
        run_command([sys.executable, "-m", "pytest"])

    print("\nQuality checks finished.")


if __name__ == "__main__":
    main()
