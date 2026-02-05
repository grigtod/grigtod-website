async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

export async function loadAllPois() {
  const pois = [];

  function addToPois(id, lat, lon, label, emoji, embedUrl) {
    pois.push({ id, lat, lon, label, emoji, embedUrl });
  }

  const loadedPOI = await fetchJson("./data/poi.json");
  loadedPOI.data.forEach((el) =>
    addToPois(el.id, el.lat, el.lon, el.label, el.emoji, el.embedUrl)
  );

  const loadedGwarek = await fetchJson("./data/gwarek.json");
  loadedGwarek.data.forEach((el) =>
    addToPois(el.id, el.lat, el.lon, el.label, "🗿", "./embeds/pomnik-gwarka.html")
  );

  const loadedPhotos = await fetchJson("./data/photo.json");
  loadedPhotos.data.forEach((el) =>
    addToPois(el.id, el.lat, el.lon, el.label, "📷", "./embeds/photo.html")
  );

  return pois;
}
