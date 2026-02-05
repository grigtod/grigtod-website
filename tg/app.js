import config from "./config.js";

const center = L.latLng(config.targetLat,config.targetLon);
const bounds = center.toBounds(config.radiusMeters * 2);

// Map init
const map = L.map("map", {
  center,
  zoom: config.startZoom,
  maxBounds: bounds,
  maxBoundsViscosity: 0.1, 
  zoomSnap: 0.1,  // allows fractional zoom (0.1 steps)
  zoomDelta: 0.1  // used by keyboard and some interactions
});

map.zoomControl.remove();

/*L.control.zoom({
  zoomInText: "+",
  zoomOutText: "−",
  zoomInTitle: "Zoom in",
  zoomOutTitle: "Zoom out"
}).addTo(map);

const ZOOM_BUTTON_DELTA = 0.5;

map.on("zoomstart", () => {
  map.options.zoomDelta = ZOOM_BUTTON_DELTA;
});

map.on("zoomend", () => {
  map.options.zoomDelta = 0.1;
});*/

map.doubleClickZoom.disable();
map.options.doubleClickZoom = false;
map.options.tapTolerance = 15;

// ---------- Tile layers ----------
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

// Start with minimalist map
let currentBaseLayer = "minimalist";
minimalistLayer.addTo(map);

// Image overlay
const imageUrl = "overlays/overlayMapTunnels.png";

// Replace these with the real corner coordinates
const imageBounds = [
  [50.40126, 18.78499], // southwest corner   
  [50.46909, 18.86915]  // northeast corner  
];

const imageOverlay = L.imageOverlay(imageUrl, imageBounds, {
  opacity: 1
});

// Track image overlay visibility
let imageOverlayVisible = false;


// UI elements
const locationBanner = document.getElementById("locationBanner");
const layersBanner = document.getElementById("layersBanner");
const bannerText = document.getElementById("bannerText");
const dismissBannerBtn = document.getElementById("dismissBannerBtn");

const myLocationBtn = document.getElementById("myLocationBtn");
const centerBtn = document.getElementById("centerBtn");
const styleToggleBtn = document.getElementById("styleToggleBtn");

const layersShowBtn = document.getElementById("layersShowBtn"); 
const toggleImageOverlayBtn = document.getElementById("toggleImageOverlayBtn");

//const distanceBanner = document.getElementById("distanceBanner");

// Overlay elements
const poiOverlay = document.getElementById("poiOverlay");
const poiOverlayFrame = document.getElementById("poiOverlayFrame");
const poiOverlayClose = document.getElementById("poiOverlayClose");
const poiCompleteBtn = document.getElementById("poiCompleteBtn");
const poiCompleteLabel = document.getElementById("poiCompleteLabel");

// State
let userLatLng = null;
let userMarker = null;
let userAccuracyCircle = null;
let userHeadingDeg = null;
let userHeadingEl = null;
let compassEnabled = false;
let compassPrimed = false;
let compassHandler = null;

var layersVisible = false;

// ---------- Overlay helpers ----------
function openOverlay(url) {
  poiOverlayFrame.src = url;
  poiOverlay.classList.remove("poi-overlay-hidden");
  poiOverlay.setAttribute("aria-hidden", "false");

  // Optional: stop map interactions while overlay is open
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

function GetCurrentlySelectedPOI()
{
  return activePoiId;
}
window.GetCurrentlySelectedPOI = GetCurrentlySelectedPOI; //fix for app.js module

poiOverlayClose.addEventListener("click", closeOverlay);

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

poiCompleteBtn.addEventListener("click", () => {
  if (!activePoiId) return;

  if (completedPois.has(activePoiId)) {
    completedPois.delete(activePoiId);
  } else {
    completedPois.add(activePoiId);
  }

  saveCompletedSet(completedPois);
  syncCompleteUi();
  updatePoiIconsForZoom();
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !poiOverlay.classList.contains("poi-overlay-hidden")) {
    closeOverlay();
  }
});

// ---------- POIs ----------

const COMPLETED_STORAGE_KEY = "discoverTG.completedPois.v1";

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


// https://pl.wikipedia.org/wiki/Rze%C5%BAby_gwark%C3%B3w_w_Tarnowskich_G%C3%B3rach
const LABEL_ZOOM_THRESHOLD = 18;

function makePoiIcon({ emoji, label, id }, showLabel) {
  const safeLabel = String(label).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  const isCompleted = completedPois.has(id);
  const classNameParts = ["poi-marker"];
  if (showLabel) classNameParts.push("show-label");
  if (isCompleted) classNameParts.push("is-completed");
  const className = classNameParts.join(" ");
  const html = `
    <div class="${className}" role="button" aria-label="${safeLabel}">
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

let pois = [];
let poiMarkers = [];

function addToPois(id, lat, lon, label, emoji, embedUrl)  //add single poi to all POIs
{
  pois.push({id, lat, lon, label, emoji, embedUrl});
}

async function fetchAndParseJSON(url) {
  try {
    const response = await fetch(url); 
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json(); 
    return data; 
  } catch (error) {
    console.error("Error fetching or parsing JSON:", error);
  }
}
 
function AddPoisToMap()
{
  poiMarkers = pois.map((poi) => {
    const marker = L.marker([poi.lat, poi.lon], {
      icon: makePoiIcon(poi, map.getZoom() >= LABEL_ZOOM_THRESHOLD),
      keyboard: true,
      riseOnHover: true
    }).addTo(map);

    marker.on("click", () => {
      activePoiId = poi.id;
      openOverlay(poi.embedUrl);
      syncCompleteUi();
    });

    marker.on("keypress", (e) => {
      if (e.originalEvent && (e.originalEvent.key === "Enter" || e.originalEvent.key === " ")) {
        openOverlay(poi.embedUrl);
      }
    });

    return { poi, marker };
  });

}

async function LoadAllPOIs()
{
  try{
    var loadedPOI = await fetchAndParseJSON("./data/poi.json");
    loadedPOI.data.forEach((element) => addToPois(element.id, element.lat, element.lon, element.label, element.emoji, element.embedUrl));
    
    var loadedGwarek = await fetchAndParseJSON("./data/gwarek.json");
    loadedGwarek.data.forEach((element) => addToPois(element.id, element.lat, element.lon, element.label, "🗿", "./embeds/pomnik-gwarka.html"));
   
    var loadedPhotos= await fetchAndParseJSON("./data/photo.json");
    loadedPhotos.data.forEach((element) => addToPois(element.id, element.lat, element.lon, element.label, "📷", "./embeds/photo.html"));
   
    AddPoisToMap();
  }
  catch (error) {
    console.error("Error calling fetchAndParseJSON:", error);
  } 
}

LoadAllPOIs();

function updatePoiIconsForZoom() {
  const showLabel = map.getZoom() >= LABEL_ZOOM_THRESHOLD;
  for (const { poi, marker } of poiMarkers) {
    marker.setIcon(makePoiIcon(poi, showLabel));
  }
}

map.on("zoomend", updatePoiIconsForZoom);


// ---------- Existing banner + geolocation ----------
function showBanner(message) {
  bannerText.textContent = message;
  locationBanner.classList.remove("banner-hidden");
}

function hideBanner() {
  locationBanner.classList.add("banner-hidden");
}

function hideLayers() {
   layersBanner.classList.add("layers-hidden");
}

function showLayers() {
   layersBanner.classList.remove("layers-hidden");  
}

/*function showTooFar(show) {
  if (show) distanceBanner.classList.remove("banner-hidden");
  else distanceBanner.classList.add("banner-hidden");
}*/

function setMyLocationEnabled(enabled) {
  myLocationBtn.disabled = !enabled;
}

/*function updateTooFarMessage() {
  if (!userLatLng) {
    showTooFar(false);
    return;
  }
  const dist = map.distance(center, userLatLng);
  showTooFar(dist > tooFarThresholdMeters);
}*/

let lastHeading = null;
const HEADING_SMOOTHING = 0.15; // 0.1–0.2 is a good range

function smoothHeading(newDeg) {
  if (lastHeading === null) {
    lastHeading = newDeg;
    return newDeg;
  }

  // shortest path around the circle
  const diff = ((newDeg - lastHeading + 540) % 360) - 180;
  lastHeading = (lastHeading + diff * HEADING_SMOOTHING + 360) % 360;
  return lastHeading;
}

function updateHeadingUi() {
  if (!userHeadingEl) return;

  const hasHeading =
    typeof userHeadingDeg === "number" && Number.isFinite(userHeadingDeg);

  userHeadingEl.classList.toggle("has-heading", hasHeading);

  if (hasHeading) {
    userHeadingEl.style.setProperty("--heading", `${userHeadingDeg}`);
  }
}

function setHeading(deg) {
  if (!Number.isFinite(deg)) return;

  const normalized = ((deg % 360) + 360) % 360;
  userHeadingDeg = smoothHeading(normalized);

  updateHeadingUi();
}

function startCompassListeners() {
  if (compassEnabled) return;
  if (typeof DeviceOrientationEvent === "undefined") return;

  compassHandler = (e) => {
    // iOS Safari uses this when available (degrees clockwise from true north)
    if (typeof e.webkitCompassHeading === "number" && Number.isFinite(e.webkitCompassHeading)) {
      setHeading(e.webkitCompassHeading);
      return;
    }

    // Many Android browsers provide alpha (device rotation around z-axis)
    if (typeof e.alpha === "number" && Number.isFinite(e.alpha)) {
      const heading = (360 - e.alpha) % 360;
      setHeading(heading);
    }
  };

  window.addEventListener("deviceorientationabsolute", compassHandler, true);
  window.addEventListener("deviceorientation", compassHandler, true);
  compassEnabled = true;
}

async function requestCompassPermissionIfNeeded() {
  if (typeof DeviceOrientationEvent === "undefined") return;

  // iOS only: permission gate
  if (typeof DeviceOrientationEvent.requestPermission !== "function") {
    startCompassListeners();
    return;
  }

  try {
    const res = await DeviceOrientationEvent.requestPermission();
    if (res === "granted") startCompassListeners();
  } catch {
    // If called without a gesture, iOS throws. We will retry on first tap.
  }
}

function enableCompassAlwaysOn() {
  // Android often works immediately
  requestCompassPermissionIfNeeded();

  // Prime first user gesture for iOS
  if (compassPrimed) return;
  compassPrimed = true;

  const unlockOnce = async () => {
    await requestCompassPermissionIfNeeded();
    window.removeEventListener("pointerdown", unlockOnce, true);
    window.removeEventListener("touchstart", unlockOnce, true);
    window.removeEventListener("click", unlockOnce, true);
  };

  window.addEventListener("pointerdown", unlockOnce, true);
  window.addEventListener("touchstart", unlockOnce, true);
  window.addEventListener("click", unlockOnce, true);
}

function renderUserLocation(pos) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const accuracy = pos.coords.accuracy;

  // Geolocation heading is often null unless the phone is moving.
  /*const h = pos.coords.heading;
  if (typeof h === "number" && Number.isFinite(h)) {
    setHeading(h);
  }*/

  userLatLng = L.latLng(lat, lng);

  if (!userMarker) {
    // Use a divIcon so we can rotate an arrow
    const icon = L.divIcon({
      className: "user-heading-icon",
      html: `<div class="user-heading"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    userMarker = L.marker(userLatLng, { icon }).addTo(map);

    // Grab the element after Leaflet creates it
    requestAnimationFrame(() => {
      userHeadingEl =
        userMarker.getElement()?.querySelector(".user-heading") || null;
      updateHeadingUi();
    });
    
    userAccuracyCircle = L.circle(userLatLng, {
      radius: accuracy
    }).addTo(map);
  } else {
    userMarker.setLatLng(userLatLng);
    userAccuracyCircle.setLatLng(userLatLng);
    userAccuracyCircle.setRadius(accuracy);

    // The element can be recreated in some cases, so re-grab if needed
    if (!userHeadingEl) {
      userHeadingEl = userMarker.getElement()?.querySelector(".user-heading") || null;
    }
  }

  setMyLocationEnabled(true);
  hideBanner();
  //updateTooFarMessage();
}

function handleLocationError(err) {
  userLatLng = null;
  setMyLocationEnabled(false);
  //updateTooFarMessage();

  if (err && err.code === 1) {
    showBanner("For the full experience, please allow location access.");
    return;
  }
  showBanner("Location is unavailable right now. Please try again.");
}

let geoWatchId = null;

// Optional: if you want to show "trying to find you" when watch starts
function showLocatingState() {
  showBanner("Getting your location…");
  setMyLocationEnabled(false);
}

// --- Replace your requestLocation() with this ---
function requestLocation() {
  if (!navigator.geolocation) {
    showBanner("Your browser does not support location.");
    setMyLocationEnabled(false);
    return;
  }

  // If already watching, do not start a second watcher
  if (geoWatchId !== null) return;

  showLocatingState();

  geoWatchId = navigator.geolocation.watchPosition(
    (pos) => renderUserLocation(pos),
    (err) => {
      handleLocationError(err);

      // If permission denied, stop watching to avoid repeated errors
      if (err && err.code === 1) {
        stopLocationUpdates();
      }
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000, // allow a recently cached fix to improve responsiveness
      timeout: 20000     // watchPosition ignores this sometimes, but keep it reasonable
    }
  );

  enableCompassAlwaysOn();
}

function stopLocationUpdates() {
  if (geoWatchId === null) return;
  navigator.geolocation.clearWatch(geoWatchId);
  geoWatchId = null;
}

// --- Add these listeners (good for mobile + battery + reliability) ---
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Optional: stop updates in background to save battery
    stopLocationUpdates();
  } else {
    // Restart when back
    requestLocation();
  }
});

window.addEventListener("pagehide", stopLocationUpdates);

// Buttons
myLocationBtn.addEventListener("click", () => {
  if (!userLatLng) return;
  map.setView(userLatLng, Math.max(map.getZoom(), 18));
  tryHideLayers();
});

centerBtn.addEventListener("click", () => {
  map.setView(center, 18);
  tryHideLayers();
});

dismissBannerBtn.addEventListener("click", () => {
  hideBanner();
  tryHideLayers();
});

layersShowBtn.addEventListener("click", () => {
  layersVisible = !layersVisible;
  if(layersVisible) showLayers();
  else hideLayers();
});

function tryHideLayers()
{
  if(layersVisible) 
  {
    layersVisible = false;
    hideLayers();
  }
}

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

// On start, request permission
document.addEventListener("DOMContentLoaded", () => {
  requestLocation();
  updatePoiIconsForZoom();
});

(function enableOneFingerZoom() {
  const el = map.getContainer();

  // Tunables
  const DOUBLE_TAP_MS = 320;      // max time between taps
  const HOLD_START_MS = 120;      // how long to hold on 2nd tap before entering zoom mode
  const PX_PER_ZOOM_LEVEL = 140;  // sensitivity: smaller = faster zoom
  const ZOOM_MIN = map.getMinZoom();
  const ZOOM_MAX = map.getMaxZoom();

  // State
  let lastTapEndTime = 0;
  let secondTapActive = false;

  let zooming = false;
  let startY = 0;
  let startZoom = 0;

  let holdTimer = null;
  let rafId = null;
  let pendingZoom = null;
  let lastTouchPoint = null;

  function clearHold() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function stopRaf() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    pendingZoom = null;
  }

  function enterZoomMode() {
    zooming = true;

    // Prevent accidental map drag while zooming
    map.dragging.disable();
  }

  function exitZoomMode() {
    clearHold();

    if (zooming) {
      zooming = false;
      map.dragging.enable();
    }

    secondTapActive = false;
    stopRaf();
    lastTouchPoint = null;
  }

  el.addEventListener("mousedown", tryHideLayers, { passive: true });

  el.addEventListener(
    "touchstart",
    (e) => {
      tryHideLayers();
      if (e.touches.length !== 1) {
        exitZoomMode();
        return;
      }

      const now = Date.now();
      const isSecondTap = now - lastTapEndTime <= DOUBLE_TAP_MS;

      // First tap: just wait for touchend to store time
      if (!isSecondTap) {
        secondTapActive = false;
        clearHold();
        return;
      }

      // Second tap began
      secondTapActive = true;

      // This is important: stop Leaflet and Safari from treating this as their own gesture
      e.preventDefault();
      e.stopPropagation();

      startY = e.touches[0].clientY;
      startZoom = map.getZoom();
      lastTouchPoint = e.touches[0];

      clearHold();
      holdTimer = setTimeout(() => {
        // If the user is still holding the second tap, enable one finger zoom mode
        if (secondTapActive) enterZoomMode();
      }, HOLD_START_MS);
    },
    { passive: false }
  );

  el.addEventListener(
    "touchmove",
    (e) => {
      if (!secondTapActive) return;
      if (e.touches.length !== 1) return;

      // Always block scroll and Leaflet drag during second tap sequence
      e.preventDefault();
      e.stopPropagation();

      lastTouchPoint = e.touches[0];

      // If hold has not triggered yet, do not zoom yet
      if (!zooming) return;

      const y = e.touches[0].clientY;
      const dy = startY - y; // up = zoom in
      const dz = dy / PX_PER_ZOOM_LEVEL;

      pendingZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, startZoom + dz));

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (pendingZoom === null || !lastTouchPoint) return;

        map.setZoomAround(lastTouchPoint, pendingZoom, { animate: false });
        pendingZoom = null;
      });
    },
    { passive: false }
  );

  el.addEventListener(
    "touchend",
    (e) => {
      // If this touchend ends the first tap, record it
      if (!secondTapActive && e.touches.length === 0) {
        lastTapEndTime = Date.now();
        return;
      }

      // If we were in second tap sequence, end it
      if (e.touches.length === 0) {
        exitZoomMode();
        lastTapEndTime = Date.now();
      }
    },
    { passive: true }
  );

  el.addEventListener("touchcancel", exitZoomMode, { passive: true });

  // Extra safety: if the overlay opens, prevent stuck dragging state
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) exitZoomMode();
  });
})();