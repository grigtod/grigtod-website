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
    def normalize_wikimedia_image_url(url: str) -> str:
        """Return the original Wikimedia file URL when input is a thumbnail URL."""
        if not isinstance(url, str):
            return ""

        if "upload.wikimedia.org/wikipedia/commons/thumb/" in url:
            # Example:
            # .../wikipedia/commons/thumb/1/1b/File.jpg/60px-File.jpg
            # -> .../wikipedia/commons/1/1b/File.jpg
            prefix = "https://upload.wikimedia.org/wikipedia/commons/thumb/"
            path = url.split(prefix, 1)[1] if prefix in url else url.split("/thumb/", 1)[1]
            segments = path.split("/")
            if len(segments) >= 4:
                return f"https://upload.wikimedia.org/wikipedia/commons/{'/'.join(segments[:-1])}"

        return url

    image_urls: set[str] = set()

    for img in cell.find_all("img"):
        src = img.get("src")
        if not src:
            continue
        if src.startswith("//"):
            src = f"https:{src}"
        elif src.startswith("/"):
            src = urljoin("https://pl.wikipedia.org", src)
        image_urls.add(normalize_wikimedia_image_url(src))

    for anchor in cell.find_all("a", href=True):
        href = anchor["href"]
        if href.startswith("//"):
            full_href = f"https:{href}"
        elif href.startswith("/"):
            full_href = urljoin("https://pl.wikipedia.org", href)
        else:
            full_href = href

        if "upload.wikimedia.org" in full_href:
            image_urls.add(normalize_wikimedia_image_url(full_href))

    return sorted(image_urls)


def clean_header_text(value: str) -> str:
    text = value.replace("\xa0", " ").strip()
    text = re.sub(r"\[[^\]]+\]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _hex_to_rgb(color_value: str):
    value = color_value.strip().lower()
    if not value.startswith("#"):
        return None

    hex_part = value[1:]
    if len(hex_part) == 3:
        hex_part = "".join(ch * 2 for ch in hex_part)
    if len(hex_part) != 6 or not re.fullmatch(r"[0-9a-f]{6}", hex_part):
        return None

    return tuple(int(hex_part[i : i + 2], 16) for i in (0, 2, 4))


def _parse_rgb_function(color_value: str):
    match = re.fullmatch(
        r"rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)",
        color_value.strip().lower(),
    )
    if not match:
        return None

    r, g, b = (int(match.group(1)), int(match.group(2)), int(match.group(3)))
    if max(r, g, b) > 255:
        return None
    return (r, g, b)


def _color_label_from_rgb(rgb):
    r, g, b = rgb
    if r >= 180 and (r - g) >= 25 and (r - b) >= 25:
        return "red"
    if r >= 170 and g >= 170 and (min(r, g) - b) >= 25:
        return "yellow"
    if g >= 140 and (g - r) >= 20 and (g - b) >= 20:
        return "green"
    return None


def _extract_color_labels(row) -> set[str]:
    labels: set[str] = set()
    elements = [row, *row.find_all(["td", "th"], recursive=False)]

    for element in elements:
        if not element:
            continue

        style = (element.get("style") or "").lower()
        bgcolor = (element.get("bgcolor") or "").lower().strip()
        style_values = []

        if style:
            style_values.extend(re.findall(r"background(?:-color)?\s*:\s*([^;]+)", style))
        if bgcolor:
            style_values.append(bgcolor)

        for value in style_values:
            color_value = value.strip()
            if not color_value:
                continue

            if "red" in color_value:
                labels.add("red")
            if "yellow" in color_value:
                labels.add("yellow")
            if "green" in color_value or "lime" in color_value:
                labels.add("green")

            rgb = _hex_to_rgb(color_value) or _parse_rgb_function(color_value)
            if rgb is not None:
                mapped = _color_label_from_rgb(rgb)
                if mapped:
                    labels.add(mapped)

    return labels


def determine_status(row, image_urls: list[str]) -> str:
    if not image_urls:
        return "no_image"

    color_labels = _extract_color_labels(row)
    if "red" in color_labels:
        return "missing"
    if "yellow" in color_labels:
        return "not_in_wroclaw"
    return "normal"


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
            status = determine_status(row, image_urls)

            results.append(
                {
                    "Współrzędne": cell_text("Współrzędne"),
                    "Imię": cell_text("Imię"),
                    "Adres": cell_text("Adres"),
                    "Autor": cell_text("Autor"),
                    "Lokalizacja": cell_text("Lokalizacja"),
                    "Zdjęcie": image_urls,
                    "status": status,
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
