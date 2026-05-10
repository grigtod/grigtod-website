from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
NAVBAR_PATH = ROOT / "reuse" / "navbar.html"
FOOTER_PATH = ROOT / "reuse" / "footer.html"

NAVBAR_PATTERN = re.compile(
    r"<!-- shared:navbar:start -->(.*?)<!-- shared:navbar:end -->",
    re.DOTALL,
)
FOOTER_PATTERN = re.compile(
    r"<!-- shared:footer:start -->(.*?)<!-- shared:footer:end -->",
    re.DOTALL,
)

RESET = "\033[0m"
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"


def read_text(path: Path) -> str:
    return repair_common_mojibake(path.read_text(encoding="utf-8-sig"))


def repair_common_mojibake(text: str) -> str:
    repaired = text
    markers = ("Ã", "Â", "ðŸ", "â€")

    for _ in range(2):
        if not any(marker in repaired for marker in markers):
            break

        try:
            candidate = repaired.encode("latin-1").decode("utf-8")
        except UnicodeError:
            break

        if candidate == repaired:
            break

        repaired = candidate

    return repaired


def detect_newline(text: str) -> str:
    return "\r\n" if "\r\n" in text else "\n"


def build_replacement(block_name: str, content: str, newline: str) -> str:
    content = content.strip("\r\n")
    return (
        f"<!-- shared:{block_name}:start -->"
        f"{newline}{content}{newline}"
        f"<!-- shared:{block_name}:end -->"
    )


def update_page(path: Path, navbar_html: str, footer_html: str) -> tuple[bool, list[str]]:
    original = read_text(path)
    newline = detect_newline(original)

    has_navbar = NAVBAR_PATTERN.search(original) is not None
    has_footer = FOOTER_PATTERN.search(original) is not None

    missing: list[str] = []
    if not has_navbar:
        missing.append("navbar")
    if not has_footer:
        missing.append("footer")

    if missing:
        return False, missing

    updated = NAVBAR_PATTERN.sub(
        build_replacement("navbar", navbar_html, newline),
        original,
        count=1,
    )
    updated = FOOTER_PATTERN.sub(
        build_replacement("footer", footer_html, newline),
        updated,
        count=1,
    )

    if updated != original:
        path.write_text(updated, encoding="utf-8", newline="")

    return True, []


def main() -> None:
    navbar_html = read_text(NAVBAR_PATH)
    footer_html = read_text(FOOTER_PATH)

    updated_pages: list[str] = []
    failed_pages: list[tuple[str, list[str]]] = []

    for html_file in sorted(ROOT.glob("*.html")):
        success, missing = update_page(html_file, navbar_html, footer_html)
        if success:
            updated_pages.append(html_file.name)
        else:
            failed_pages.append((html_file.name, missing))

    print(f"{GREEN}Updated pages:{RESET}")
    if updated_pages:
        for page in updated_pages:
            print(f"  {GREEN}[UPDATED]{RESET} {page}")
    else:
        print("  None")

    print()
    print(f"{YELLOW}Pages not updated:{RESET}")
    if failed_pages:
        for page, missing in failed_pages:
            missing_text = ", ".join(missing)
            print(f"  {RED}[FAILED]{RESET} {page} (missing: {missing_text})")
    else:
        print("  None")


if __name__ == "__main__":
    main()
