from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SHARED_CSS_PATH = ROOT / "reuse" / "style.css"

CSS_PATTERN = re.compile(
    r"<!-- shared:css:start -->(.*?)<!-- shared:css:end -->",
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


def minify_css(css_text: str) -> str:
    css_text = re.sub(r"/\*.*?\*/", "", css_text, flags=re.DOTALL)
    css_text = re.sub(r"\s+", " ", css_text)
    css_text = re.sub(r"\s*([{}:;,>])\s*", r"\1", css_text)
    css_text = re.sub(r";}", "}", css_text)
    return css_text.strip()


def build_replacement(css_text: str, newline: str) -> str:
    minified_css = minify_css(css_text)
    return (
        f"<!-- shared:css:start -->{newline}"
        f"<style>{minified_css}</style>{newline}"
        f"<!-- shared:css:end -->"
    )


def update_page(path: Path, css_text: str) -> tuple[bool, list[str]]:
    original = read_text(path)
    newline = detect_newline(original)

    has_css = CSS_PATTERN.search(original) is not None
    if not has_css:
        return False, ["css"]

    updated = CSS_PATTERN.sub(
        build_replacement(css_text, newline),
        original,
        count=1,
    )

    if updated != original:
        path.write_text(updated, encoding="utf-8", newline="")

    return True, []


def main() -> None:
    css_text = read_text(SHARED_CSS_PATH)

    updated_pages: list[str] = []
    failed_pages: list[tuple[str, list[str]]] = []

    for html_file in sorted(ROOT.glob("*.html")):
        success, missing = update_page(html_file, css_text)
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
