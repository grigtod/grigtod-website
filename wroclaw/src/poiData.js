async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

function slugify(input) {
  return String(input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function loadAllPois() {
  const pois = [];

  function addToPois(id, lat, lon, label, emoji, embedUrl, labelKey = null, iconUrl = null) {
    pois.push({ id, lat, lon, label, emoji, embedUrl, labelKey, iconUrl });
  }

  const loadedStatues = await fetchJson("./DataParser/wroclawskie_krasnale.json");

  loadedStatues.forEach((el, index) => {
    if (el.status !== "normal") return;

    const coordsRaw = el["Współrzędne"];
    if (typeof coordsRaw !== "string") return;

    const parts = coordsRaw.split("/");
    if (parts.length < 2) return;

    const afterSlash = parts[1].trim();
    if (!afterSlash) return;

    const [latRaw, lonRaw] = afterSlash.split(/\s+/);
    if (!latRaw || !lonRaw) return;

    const lat = Number(latRaw.replace(",", "."));
    const lon = Number(lonRaw.replace(",", "."));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    const label = (el["Imię"] || "Krasnal").trim() || "Krasnal";
    const baseId = slugify(label) || `krasnal-${index + 1}`;
    const id = `krasnal-${baseId}-${index + 1}`;

    const photos = Array.isArray(el["Zdjęcie"]) ? el["Zdjęcie"] : [];
    const embedUrl =
      typeof photos[0] === "string" && photos[0]
        ? photos[0]
        : "https://pl.wikipedia.org/wiki/Wroc%C5%82awskie_krasnale";

    addToPois(id, lat, lon, label, "\u{1F9DD}", embedUrl, null, "./images/dwarf.png");
  });

  /*const loadedPOI = await fetchJson("./data/poi.json");
  loadedPOI.data.forEach((el) =>
    addToPois(el.id, el.lat, el.lon, el.label, el.emoji, el.embedUrl, `poi.${el.id}`)
  );*/

  /*const loadedGwarek = await fetchJson("./data/gwarek.json");
  loadedGwarek.data.forEach((el) =>
    addToPois(
      el.id,
      el.lat,
      el.lon,
      el.label,
      "ðŸ—¿",
      "./embeds/pomnik-gwarka.html",
      `poi.${el.id}`
    )
  );*/

  /*const loadedPhotos = await fetchJson("./data/photo.json");
  loadedPhotos.data.forEach((el) =>
    addToPois(el.id, el.lat, el.lon, el.label, "ðŸ“·", "./embeds/photo.html", `poi.${el.id}`)
  );*/

  return pois;
}
