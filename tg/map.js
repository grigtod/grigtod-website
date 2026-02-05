// map.js
import config from "./config.js";

export function createMap({
  mapElId = "map",

  // DOM hooks passed in so map.js is not tied to globals
  ui: {
    poiOverlay,
    poiOverlayFrame,
    poiOverlayClose,
    poiCompleteBtn,
    poiCompleteLabel,
    bannerText,
    locationBanner,
    layersBanner,
    myLocationBtn,
    centerBtn,
    dismissBannerBtn,
    layersShowBtn,
    toggleImageOverlayBtn,
    styleToggleBtn
  }
} = {}) {
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

  // Tile layers
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

  // POI state
  const COMPLETED_STORAGE_KEY = "discoverTG.completedPois.v1";
  const LABEL_ZOOM_THRESHOLD = 18;

  function loadCompletedSet() {
    try {
      const raw = localStorage.getItem(COMPLETED_STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  function saveCompletedSet(set) {
    localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify([...set]));
  }

  const completedPois = loadCompletedSet();
  let activePoiId = null;

  function getCurrentlySelectedPOI() {
    return activePoiId;
  }

  function openOverlay(url, poiId) {
    const u = new URL(url, window.location.href);

    if (poiId != null) u.searchParams.set("poiId", poiId);

    poiOverlayFrame.src = u.toString();
    poiOverlay.classList.remove("poi-overlay-hidden");
    poiOverlay.setAttribute("aria-hidden", "false");

    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
  }

  function closeOverlay() {
    poiOverlayFrame.src = "about:blank";
    poiOverlay.classList.add("poi-overlay-hidden");
    poiOverlay.setAttribute("aria-hidden", "true");

    activePoiId = null;

    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
  }

  function syncCompleteUi() {
    if (!activePoiId) return;

    const isDone = completedPois.has(activePoiId);

    if (isDone) {
      poiCompleteBtn.classList.add("is-complete");
      poiCompleteBtn.setAttribute("aria-pressed", "true");
      poiCompleteLabel.textContent = "Completed";
    } else {
      poiCompleteBtn.classList.remove("is-complete");
      poiCompleteBtn.setAttribute("aria-pressed", "false");
      poiCompleteLabel.textContent = "Complete";
    }
  }

  poiOverlayClose.addEventListener("click", closeOverlay);

  poiCompleteBtn.addEventListener("click", () => {
    if (!activePoiId) return;

    if (completedPois.has(activePoiId)) completedPois.delete(activePoiId);
    else completedPois.add(activePoiId);

    saveCompletedSet(completedPois);
    syncCompleteUi();
    updatePoiIconsForZoom();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !poiOverlay.classList.contains("poi-overlay-hidden")) {
      closeOverlay();
    }
  });

  function makePoiIcon({ emoji, label, id }, showLabel) {
    const safeLabel = String(label)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

    const isCompleted = completedPois.has(id);
    const classNameParts = ["poi-marker"];
    if (showLabel) classNameParts.push("show-label");
    if (isCompleted) classNameParts.push("is-completed");

    const html = `
      <div class="${classNameParts.join(" ")}" role="button" aria-label="${safeLabel}">
        <span class="poi-emoji">${emoji}</span>
        <span class="poi-label">${safeLabel}</span>
      </div>
    `;

    return L.divIcon({ className: "poi-icon", html, iconSize: [1, 1] });
  }

  let pois = [];
  let poiMarkers = [];

  function addToPois(id, lat, lon, label, emoji, embedUrl) {
    pois.push({ id, lat, lon, label, emoji, embedUrl });
  }

  async function fetchAndParseJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  }

  function AddPoisToMap() {
    poiMarkers = pois.map((poi) => {
      const marker = L.marker([poi.lat, poi.lon], {
        icon: makePoiIcon(poi, map.getZoom() >= LABEL_ZOOM_THRESHOLD),
        keyboard: true,
        riseOnHover: true
      }).addTo(map);

      marker.on("click", () => {
        activePoiId = poi.id;
        openOverlay(poi.embedUrl, activePoiId);
        syncCompleteUi();
      });

      /*marker.on("keypress", (e) => {
        if (e.originalEvent && (e.originalEvent.key === "Enter" || e.originalEvent.key === " ")) {
          openOverlay(poi.embedUrl);
        }
      });*/

      return { poi, marker };
    });
  }

  async function LoadAllPOIs() {
    const loadedPOI = await fetchAndParseJSON("./data/poi.json");
    loadedPOI.data.forEach((el) => addToPois(el.id, el.lat, el.lon, el.label, el.emoji, el.embedUrl));

    const loadedGwarek = await fetchAndParseJSON("./data/gwarek.json");
    loadedGwarek.data.forEach((el) => addToPois(el.id, el.lat, el.lon, el.label, "🗿", "./embeds/pomnik-gwarka.html"));

    const loadedPhotos = await fetchAndParseJSON("./data/photo.json");
    loadedPhotos.data.forEach((el) => addToPois(el.id, el.lat, el.lon, el.label, "📷", "./embeds/photo.html"));

    AddPoisToMap();
  }

  function updatePoiIconsForZoom() {
    const showLabel = map.getZoom() >= LABEL_ZOOM_THRESHOLD;
    for (const { poi, marker } of poiMarkers) marker.setIcon(makePoiIcon(poi, showLabel));
  }

  map.on("zoomend", updatePoiIconsForZoom);

  // Minimal UI helpers you already had
  function showBanner(message) {
    bannerText.textContent = message;
    locationBanner.classList.remove("banner-hidden");
  }

  function hideBanner() {
    locationBanner.classList.add("banner-hidden");
  }

  let layersVisible = false;
  function hideLayers() {
    layersBanner.classList.add("layers-hidden");
  }
  function showLayers() {
    layersBanner.classList.remove("layers-hidden");
  }
  function tryHideLayers() {
    if (layersVisible) {
      layersVisible = false;
      hideLayers();
    }
  }

  layersShowBtn.addEventListener("click", () => {
    layersVisible = !layersVisible;
    if (layersVisible) showLayers();
    else hideLayers();
  });

  toggleImageOverlayBtn.addEventListener("click", () => {
    if (imageOverlayVisible) {
      map.removeLayer(imageOverlay);
      imageOverlayVisible = false;
      toggleImageOverlayBtn.textContent = "Show tunnels map";
    } else {
      imageOverlay.addTo(map);
      map.setZoom(12);
      imageOverlayVisible = true;
      toggleImageOverlayBtn.textContent = "Hide tunnels map";
    }
  });

  styleToggleBtn.addEventListener("click", () => {
    if (currentBaseLayer === "minimalist") {
      map.removeLayer(minimalistLayer);
      detailedLayer.addTo(map);
      currentBaseLayer = "detailed";
      styleToggleBtn.textContent = "Minimal map";
    } else {
      map.removeLayer(detailedLayer);
      minimalistLayer.addTo(map);
      currentBaseLayer = "minimalist";
      styleToggleBtn.textContent = "Detailed map";
    }
  });

  centerBtn.addEventListener("click", () => {
    map.setView(center, 18);
    tryHideLayers();
  });

  dismissBannerBtn.addEventListener("click", () => {
    hideBanner();
    tryHideLayers();
  });

  // Start POIs when module is created
  LoadAllPOIs().catch((err) => console.error(err));

  // Export the bits other modules might need
  return {
    map,
    center,
    getCurrentlySelectedPOI,
    openOverlay,
    closeOverlay,
    updatePoiIconsForZoom
  };
}
