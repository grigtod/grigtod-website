import config from "./config.js";
import { createPoiOverlay } from "./overlay.js";
import { loadAllPois } from "./poiData.js";
import { createPoiLayer } from "./poiLayer.js";

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
  

  const tunnelsSubtitle =
  ui.toggleImageOverlayBtn.querySelector(".layer-tile-subtitle");

    ui.toggleImageOverlayBtn.addEventListener("click", () => {
    if (imageOverlayVisible) {
        map.removeLayer(imageOverlay);
        imageOverlayVisible = false;

        if (tunnelsSubtitle) tunnelsSubtitle.textContent = "Off";
        ui.toggleImageOverlayBtn.classList.remove("is-active");

    } else {
        imageOverlay.addTo(map);
        map.setZoom(12);
        imageOverlayVisible = true;

        if (tunnelsSubtitle) tunnelsSubtitle.textContent = "On";
        ui.toggleImageOverlayBtn.classList.add("is-active");
    }
    });


  

    const styleSubtitle =
    ui.styleToggleBtn.querySelector(".layer-tile-subtitle");

    ui.styleToggleBtn.addEventListener("click", () => {
    if (currentBaseLayer === "minimalist") {
        map.removeLayer(minimalistLayer);
        detailedLayer.addTo(map);

        currentBaseLayer = "detailed";

        if (styleSubtitle) styleSubtitle.textContent = "Minimal";
        ui.styleToggleBtn.classList.add("is-active");
    } else {
        map.removeLayer(detailedLayer);
        minimalistLayer.addTo(map);

        currentBaseLayer = "minimalist";

        if (styleSubtitle) styleSubtitle.textContent = "Detailed";
        ui.styleToggleBtn.classList.remove("is-active");
    }
    });
  




  map.getContainer().addEventListener("mousedown", tryHideLayers, { passive: true });
  map.getContainer().addEventListener("touchstart", tryHideLayers, { passive: true });

  const poiLayer = createPoiLayer({ map, overlay, labelZoomThreshold: 18 });
  loadAllPois()
    .then((pois) => poiLayer.setPois(pois))
    .catch((err) => console.error("POI load failed:", err));

    document.addEventListener("poi:complete-changed", () => poiLayer.updateIcons());


  // ---- Center button (map-related) ----
  ui.centerBtn.addEventListener("click", () => {
    map.setView(center, 18);
    tryHideLayers();
  });

  // ---- Location permission + my location flow ----
  let isRequestInFlight = false;
  let hasLocationPermission = false;
  let userMarker = null;

  function hideLocationBanner() {
    ui.locationBanner.classList.add("banner-hidden");
    ui.locationBanner.classList.remove("banner-notice");
  }

  function showLocationPrompt() {
    ui.bannerText.textContent =
      "Allow location access to use My Location.";
    ui.grantLocationBtn.classList.remove("banner-btn-hidden");
    ui.grantLocationBtn.disabled = false;
    ui.grantLocationBtn.textContent = "Allow location";
    ui.dismissBannerBtn.classList.remove("banner-btn-hidden");
    ui.locationBanner.classList.remove("banner-hidden", "banner-notice");
  }

  function showLocationNotice(message) {
    ui.bannerText.textContent = message;
    ui.grantLocationBtn.classList.add("banner-btn-hidden");
    ui.grantLocationBtn.disabled = false;
    ui.grantLocationBtn.textContent = "Allow location";
    ui.dismissBannerBtn.classList.remove("banner-btn-hidden");
    ui.locationBanner.classList.remove("banner-hidden");
    ui.locationBanner.classList.add("banner-notice");
  }

  function enableMyLocation() {
    hasLocationPermission = true;
    ui.myLocationBtn.disabled = false;
  }

  function disableMyLocation() {
    hasLocationPermission = false;
    ui.myLocationBtn.disabled = true;
  }

  function updateUserMarker(latlng) {
    if (!userMarker) {
      userMarker = L.circleMarker(latlng, {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: "#0078ff",
        fillOpacity: 0.95
      }).addTo(map);
      return;
    }
    userMarker.setLatLng(latlng);
  }

  function permissionErrorMessage(error) {
    if (!error || typeof error.code !== "number") {
      return "Location access failed. You can try again from your browser settings.";
    }
    if (error.code === error.PERMISSION_DENIED) {
      return "Location permission was denied. Enable it in browser settings, then reload.";
    }
    if (error.code === error.POSITION_UNAVAILABLE) {
      return "Your location is unavailable right now. Try again in a moment.";
    }
    if (error.code === error.TIMEOUT) {
      return "Location request timed out. Try again.";
    }
    return "Location access failed. You can try again from your browser settings.";
  }

  function requestLocationPermission() {
    if (!navigator.geolocation || isRequestInFlight) return;
    isRequestInFlight = true;
    ui.grantLocationBtn.disabled = true;
    ui.grantLocationBtn.textContent = "Requesting...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        isRequestInFlight = false;
        enableMyLocation();
        hideLocationBanner();
        const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
        updateUserMarker(latlng);
      },
      (error) => {
        isRequestInFlight = false;
        disableMyLocation();
        showLocationNotice(permissionErrorMessage(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  ui.grantLocationBtn.addEventListener("click", () => {
    requestLocationPermission();
  });

  ui.dismissBannerBtn.addEventListener("click", () => {
    hideLocationBanner();
  });

  ui.myLocationBtn.addEventListener("click", () => {
    tryHideLayers();
    if (!hasLocationPermission) {
      showLocationPrompt();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
        updateUserMarker(latlng);
        const targetZoom = Math.max(map.getZoom(), 17);
        map.setView(latlng, targetZoom);
      },
      (error) => {
        showLocationNotice(permissionErrorMessage(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  });

  if (!navigator.geolocation) {
    disableMyLocation();
    showLocationNotice("Location is not supported in this browser.");
  } else if (navigator.permissions?.query) {
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (status.state === "granted") {
          enableMyLocation();
          hideLocationBanner();
        } else {
          disableMyLocation();
          showLocationPrompt();
        }

        status.onchange = () => {
          if (status.state === "granted") {
            enableMyLocation();
            hideLocationBanner();
          } else {
            disableMyLocation();
            showLocationPrompt();
          }
        };
      })
      .catch(() => {
        disableMyLocation();
        showLocationPrompt();
      });
  } else {
    disableMyLocation();
    showLocationPrompt();
  }

  // Return API if other modules need it
  return {
    map,
    overlay,
    center
  };
}
