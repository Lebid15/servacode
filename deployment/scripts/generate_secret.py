"""
=====================================================
Generate Secret
ينشئ SECRET_KEY عشوائي مناسب للإنتاج
=====================================================
"""

from secrets import token_urlsafe


def main() -> None:
    """
    طباعة سر عشوائي.
    """
    print(token_urlsafe(64))


if __name__ == "__main__":
    main()
