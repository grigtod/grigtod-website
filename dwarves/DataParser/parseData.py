import argparse
import json
import re
from urllib.parse import urljoin

import requests
import wikipedia
from bs4 import BeautifulSoup


WIKI_API = "https://pl.wikipedia.org/w/api.php"
TARGET_COLUMNS = ["Współrzędne", "Imię", "Adres", "Autor", "Lokalizacja", "Zdjęcie"]
USER_AGENT = "DataParser/1.0 (Windows; Python requests; contact: local-script)"
SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": USER_AGENT,
        "Accept": "application/json, text/plain, */*",
    }
)


def extract_image_urls(cell) -> list[str]:
    image_urls: set[str] = set()

    for img in cell.find_all("img"):
        src = img.get("src")
        if not src:
            continue
        if src.startswith("//"):
            src = f"https:{src}"
        elif src.startswith("/"):
            src = urljoin("https://pl.wikipedia.org", src)
        image_urls.add(src)

    for anchor in cell.find_all("a", href=True):
        href = anchor["href"]
        if href.startswith("//"):
            full_href = f"https:{href}"
        elif href.startswith("/"):
            full_href = urljoin("https://pl.wikipedia.org", href)
        else:
            full_href = href

        if "upload.wikimedia.org" in full_href:
            image_urls.add(full_href)

    return sorted(image_urls)


def clean_header_text(value: str) -> str:
    text = value.replace("\xa0", " ").strip()
    text = re.sub(r"\[[^\]]+\]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def get_page_html(title: str) -> str:
    wikipedia.set_lang("pl")
    page = wikipedia.page(title=title, auto_suggest=False, redirect=True)
    params = {
        "action": "parse",
        "format": "json",
        "pageid": page.pageid,
        "prop": "text",
    }
    response = SESSION.get(WIKI_API, params=params, timeout=30)
    response.raise_for_status()
    return response.json()["parse"]["text"]["*"]


def parse_dwarves_table_rows(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    results: list[dict] = []

    for table in soup.select("table.wikitable"):
        all_rows = table.find_all("tr")
        header_index = None
        data_start_idx = None

        for row_idx, row in enumerate(all_rows):
            th_cells = row.find_all("th")
            if not th_cells:
                continue

            headers = [clean_header_text(th.get_text(" ", strip=True)) for th in th_cells]
            if all(col in headers for col in TARGET_COLUMNS):
                header_index = {h: i for i, h in enumerate(headers)}
                data_start_idx = row_idx + 1
                break

        if header_index is None or data_start_idx is None:
            continue

        rows = all_rows[data_start_idx:]
        for row in rows:
            cells = row.find_all(["td", "th"], recursive=False)
            if not cells:
                cells = row.find_all(["td", "th"])
            if not cells:
                continue

            def cell_text(column_name: str) -> str:
                idx = header_index.get(column_name)
                if idx is None or idx >= len(cells):
                    return ""
                return cells[idx].get_text(" ", strip=True)

            image_idx = header_index.get("Zdjęcie")
            image_urls = []
            if image_idx is not None and image_idx < len(cells):
                image_urls = extract_image_urls(cells[image_idx])

            results.append(
                {
                    "Współrzędne": cell_text("Współrzędne"),
                    "Imię": cell_text("Imię"),
                    "Adres": cell_text("Adres"),
                    "Autor": cell_text("Autor"),
                    "Lokalizacja": cell_text("Lokalizacja"),
                    "Zdjęcie": image_urls,
                }
            )

    return results


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Parse dwarves tables from Polish Wikipedia page."
    )
    parser.add_argument(
        "--title",
        default="Wrocławskie krasnale",
        help="Wikipedia page title in Polish.",
    )
    parser.add_argument(
        "--output",
        default="wroclawskie_krasnale.json",
        help="Output JSON file path.",
    )
    args = parser.parse_args()

    html = get_page_html(args.title)
    records = parse_dwarves_table_rows(html)

    with open(args.output, "w", encoding="utf-8") as file:
        json.dump(records, file, ensure_ascii=False, indent=2)

    print(f"Saved {len(records)} records to {args.output}")


if __name__ == "__main__":
    main()
