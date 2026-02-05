// map.js
import config from "./config.js";
import { createPoiOverlay } from "./overlay.js";

export function createMap({ mapElId = "map", ui } = {}) {
  if (!ui) throw new Error("createMap requires { ui }");

  // ---- Leaflet init ----
  const center = L.latLng(config.targetLat, config.targetLon);
  const bounds = center.toBounds(config.radiusMeters * 2);

  const map = L.map(mapElId, {
    center,
    zoom: config.startZoom,
    maxBounds: bounds,
    maxBoundsViscosity: 0.1,
    zoomSnap: 0.1,
    zoomDelta: 0.1
  });

  map.zoomControl.remove();
  map.doubleClickZoom.disable();
  map.options.doubleClickZoom = false;
  map.options.tapTolerance = 15;

  // ---- Overlay module ----
  function disableMapInteractions() {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
  }

  function enableMapInteractions() {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
  }

  const overlay = createPoiOverlay({
    overlayEl: ui.poiOverlay,
    frameEl: ui.poiOverlayFrame,
    closeBtnEl: ui.poiOverlayClose,
    completeBtnEl: ui.poiCompleteBtn,
    completeLabelEl: ui.poiCompleteLabel,

    // optional but recommended if you add these in overlay.js
    onOpen: disableMapInteractions,
    onClose: enableMapInteractions,
    onToggleComplete: () => updatePoiIconsForZoom()
  });

  // If your overlay.js does NOT support callbacks yet,
  // remove onOpen/onClose/onToggleComplete above and instead do:
  // - call disableMapInteractions() right after overlay.open(...)
  // - wrap overlay.close to re-enable interactions

  // ---- Tile layers ----
  const minimalistLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: config.maxZoom,
      minZoom: config.minZoom,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>'
    }
  );

  const detailedLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: config.maxZoom,
      minZoom: config.minZoom,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  );

  let currentBaseLayer = "minimalist";
  minimalistLayer.addTo(map);

  // Image overlay
  const imageUrl = "overlays/overlayMapTunnels.png";
  const imageBounds = [
    [50.40126, 18.78499],
    [50.46909, 18.86915]
  ];

  const imageOverlay = L.imageOverlay(imageUrl, imageBounds, { opacity: 1 });
  let imageOverlayVisible = false;

  // ---- UI bindings that are still map-related ----
  let layersVisible = false;

  function hideLayers() {
    ui.layersBanner.classList.add("layers-hidden");
  }

  function showLayers() {
    ui.layersBanner.classList.remove("layers-hidden");
  }

  function tryHideLayers() {
    if (!layersVisible) return;
    layersVisible = false;
    hideLayers();
  }

  ui.layersShowBtn.addEventListener("click", () => {
    layersVisible = !layersVisible;
    if (layersVisible) showLayers();
    else hideLayers();
  });

  ui.toggleImageOverlayBtn.addEventListener("click", () => {
    if (imageOverlayVisible) {
      map.removeLayer(imageOverlay);
      imageOverlayVisible = false;
      ui.toggleImageOverlayBtn.textContent = "Show tunnels map";
    } else {
      imageOverlay.addTo(map);
      map.setZoom(12);
      imageOverlayVisible = true;
      ui.toggleImageOverlayBtn.textContent = "Hide tunnels map";
    }
  });

  ui.styleToggleBtn.addEventListener("click", () => {
    if (currentBaseLayer === "minimalist") {
      map.removeLayer(minimalistLayer);
      detailedLayer.addTo(map);
      currentBaseLayer = "detailed";
      ui.styleToggleBtn.textContent = "Minimal map";
    } else {
      map.removeLayer(detailedLayer);
      minimalistLayer.addTo(map);
      currentBaseLayer = "minimalist";
      ui.styleToggleBtn.textContent = "Detailed map";
    }
  });

  map.getContainer().addEventListener("mousedown", tryHideLayers, { passive: true });
  map.getContainer().addEventListener("touchstart", tryHideLayers, { passive: true });

  // ---- POIs ----
  const LABEL_ZOOM_THRESHOLD = 18;
  let pois = [];
  let poiMarkers = [];

  function makePoiIcon({ emoji, label, id }, showLabel) {
    const safeLabel = String(label)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

    const isCompleted = overlay.isCompleted(id);

    const classNameParts = ["poi-marker"];
    if (showLabel) classNameParts.push("show-label");
    if (isCompleted) classNameParts.push("is-completed");

    const html = `
      <div class="${classNameParts.join(" ")}" role="button" aria-label="${safeLabel}">
        <span class="poi-emoji">${emoji}</span>
        <span class="poi-label">${safeLabel}</span>
      </div>
    `;

    return L.divIcon({
      className: "poi-icon",
      html,
      iconSize: [1, 1]
    });
  }

  function updatePoiIconsForZoom() {
    const showLabel = map.getZoom() >= LABEL_ZOOM_THRESHOLD;
    for (const { poi, marker } of poiMarkers) {
      marker.setIcon(makePoiIcon(poi, showLabel));
    }
  }

  map.on("zoomend", updatePoiIconsForZoom);

  function addToPois(id, lat, lon, label, emoji, embedUrl) {
    pois.push({ id, lat, lon, label, emoji, embedUrl });
  }

  async function fetchAndParseJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status} for ${url}`);
    return await response.json();
  }

  function addPoisToMap() {
    poiMarkers = pois.map((poi) => {
      const marker = L.marker([poi.lat, poi.lon], {
        icon: makePoiIcon(poi, map.getZoom() >= LABEL_ZOOM_THRESHOLD),
        keyboard: true,
        riseOnHover: true
      }).addTo(map);

      marker.on("click", () => {
        overlay.open({ url: poi.embedUrl, poiId: poi.id });
      });

      marker.on("keypress", (e) => {
        const k = e.originalEvent?.key;
        if (k === "Enter" || k === " ") overlay.open({ url: poi.embedUrl, poiId: poi.id });
      });

      return { poi, marker };
    });
  }

  async function loadAllPOIs() {
    const loadedPOI = await fetchAndParseJSON("./data/poi.json");
    loadedPOI.data.forEach((el) =>
      addToPois(el.id, el.lat, el.lon, el.label, el.emoji, el.embedUrl)
    );

    const loadedGwarek = await fetchAndParseJSON("./data/gwarek.json");
    loadedGwarek.data.forEach((el) =>
      addToPois(el.id, el.lat, el.lon, el.label, "🗿", "./embeds/pomnik-gwarka.html")
    );

    const loadedPhotos = await fetchAndParseJSON("./data/photo.json");
    loadedPhotos.data.forEach((el) =>
      addToPois(el.id, el.lat, el.lon, el.label, "📷", "./embeds/photo.html")
    );

    addPoisToMap();
    updatePoiIconsForZoom();
  }

  loadAllPOIs().catch((err) => console.error("POI load failed:", err));

  // ---- Center button (map-related) ----
  ui.centerBtn.addEventListener("click", () => {
    map.setView(center, 18);
    tryHideLayers();
  });

  // Return API if other modules need it
  return {
    map,
    overlay,
    center,
    updatePoiIconsForZoom
  };
}
