import config from "./config.js";
import { createPoiOverlay } from "./overlay.js";
import { loadAllPois } from "./poiData.js";
import { createPoiLayer } from "./poiLayer.js";

export function createMap({ mapElId = "map", ui } = {}) {
  if (!ui) throw new Error("createMap requires { ui }");
  const layersControlsEnabled = false;
  const languageControlsEnabled = false;
  const infoControlsEnabled = true;
  const t = (_key, fallback) => fallback;
  const localizeUrl = (url) => url;

  const center = L.latLng(config.targetLat, config.targetLon);
  const platform =
    navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || "";
  const isWindows = /win/i.test(platform);
  const isMobileViewport = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
  const cityCenterZoom = 18;
  const initialZoom = isMobileViewport ? cityCenterZoom : config.startZoom;
  const zoomSnap = isWindows ? 0.5 : 0.1;
  const zoomDelta = isWindows ? 0.5 : 0.1;
  const wheelDebounceTime = isWindows ? 20 : 40;
  const wheelPxPerZoomLevel = isWindows ? 40 : 60;

  const map = L.map(mapElId, {
    center,
    zoom: initialZoom,
    zoomSnap,
    zoomDelta,
    wheelDebounceTime,
    wheelPxPerZoomLevel
  });

  map.zoomControl.remove();
  map.doubleClickZoom.disable();
  map.options.doubleClickZoom = false;
  map.options.tapTolerance = 15;

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
    onOpen: disableMapInteractions,
    onClose: enableMapInteractions,
    translate: (key, fallback, vars) => t(key, fallback, vars),
    localizeUrl
  });

  const minimalistLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: config.maxZoom,
      minZoom: config.minZoom,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
    }
  );

  const detailedLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: config.maxZoom,
      minZoom: config.minZoom,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  );

  let currentBaseLayer = "minimalist";
  minimalistLayer.addTo(map);

  const imageOverlay = L.imageOverlay(
    "overlays/overlayMapTunnels.png",
    [
      [50.40126, 18.78499],
      [50.46909, 18.86915]
    ],
    { opacity: 1 }
  );
  let imageOverlayVisible = false;

  const layersTitle = ui.layersBanner.querySelector(".layers-title");
  const baseMapTitle = ui.styleToggleBtn.querySelector(".layer-tile-title");
  const styleSubtitle = ui.styleToggleBtn.querySelector(".layer-tile-subtitle");
  const tunnelsTitle = ui.toggleImageOverlayBtn.querySelector(".layer-tile-title");
  const tunnelsSubtitle = ui.toggleImageOverlayBtn.querySelector(".layer-tile-subtitle");

  let layersVisible = false;
  let languageMenuVisible = false;
  const LANGUAGE_TO_COUNTRY = {
    en: "gb",
    pl: "pl",
    de: "de",
    es: "es",
    fr: "fr",
    uk: "ua"
  };

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

  function hideLanguageMenu() {
    languageMenuVisible = false;
    ui.languageMenu.classList.add("language-menu-hidden");
  }

  function showLanguageMenu() {
    languageMenuVisible = true;
    ui.languageMenu.classList.remove("language-menu-hidden");
  }

  function getLanguageFlagUrl(code) {
    const country = LANGUAGE_TO_COUNTRY[code] || "gb";
    return `https://flagcdn.com/${country}.svg`;
  }

  function createLanguageFlagElement(language, className) {
    const wrapper = document.createElement("span");
    wrapper.className = className;

    const img = document.createElement("img");
    img.className = "language-flag-img";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.src = getLanguageFlagUrl(language.code);
    img.loading = "lazy";

    img.addEventListener("error", () => {
      wrapper.textContent = language.flag || language.code.toUpperCase();
    });

    wrapper.append(img);
    return wrapper;
  }

  function setLanguageButtonAppearance() {
    const selectedLanguage = { code: "pl", flag: "\u{1F1F5}\u{1F1F1}", name: "Polski" };
    ui.languageBtn.replaceChildren(createLanguageFlagElement(selectedLanguage, "language-btn-flag"));
    ui.languageBtn.setAttribute("title", selectedLanguage.name);
    ui.languageBtn.setAttribute("aria-label", "Wybierz język");
  }

  async function onLanguageSelected() {
    hideLanguageMenu();
  }

  function renderLanguageOptions() {
    ui.languageOptions.textContent = "";
  }

  const infoPages = {
    credits: "./embeds/info-credits.html"
  };
  let activeInfoPage = "credits";

  function setInfoHidden(hidden) {
    ui.infoOverlay.classList.toggle("poi-overlay-hidden", hidden);
    ui.infoOverlay.setAttribute("aria-hidden", hidden ? "true" : "false");
  }

  function openInfoPage(pageKey = "credits") {
    const nextKey = infoPages[pageKey] ? pageKey : "credits";
    activeInfoPage = nextKey;
    ui.infoOverlayFrame.src = localizeUrl(infoPages[nextKey]);
    setInfoHidden(false);
  }

  function closeInfoOverlay() {
    ui.infoOverlayFrame.src = "about:blank";
    setInfoHidden(true);
  }

  function updateLayerSubtitles() {
    if (styleSubtitle) {
      styleSubtitle.textContent =
        currentBaseLayer === "minimalist"
          ? t("app.layers.styleMinimal", "Minimal")
          : t("app.layers.styleDetailed", "Detailed");
    }

    if (tunnelsSubtitle) {
      tunnelsSubtitle.textContent = imageOverlayVisible
        ? t("app.layers.on", "On")
        : t("app.layers.off", "Off");
    }
  }

  function applyStaticTranslations() {
    ui.languageMenuTitle.textContent = t("app.language.menuTitle", "Language");
    layersTitle.textContent = t("app.layers.title", "Map Layers");
    baseMapTitle.textContent = t("app.layers.baseMap", "Base map");
    tunnelsTitle.textContent = t("app.layers.tunnelsOverlay", "Tunnels Overlay");
    ui.poiOverlayClose.textContent = t("app.poi.cancel", "Cancel");
    ui.infoOverlayClose.textContent = t("app.info.close", "Close");
    ui.dismissBannerBtn.textContent = t("app.location.dismiss", "Dismiss");

    ui.myLocationBtn.setAttribute("aria-label", t("app.controls.myLocation", "My location"));
    ui.centerBtn.setAttribute("aria-label", t("app.controls.centerCity", "Center city"));
    ui.layersShowBtn.setAttribute("aria-label", t("app.controls.layers", "Map layers"));
    ui.infoBtn.setAttribute("aria-label", t("app.controls.info", "Information"));
    ui.languageMenu.setAttribute("aria-label", t("app.language.menuTitle", "Language"));
    ui.languageOptions.setAttribute("aria-label", t("app.language.menuTitle", "Languages"));

    if (languageControlsEnabled) {
      setLanguageButtonAppearance();
      renderLanguageOptions();
    }
    updateLayerSubtitles();
    refreshLocationBanner();
    overlay.syncCompleteUi();
  }

  if (layersControlsEnabled) {
    ui.layersShowBtn.addEventListener("click", () => {
      hideLanguageMenu();
      layersVisible = !layersVisible;
      if (layersVisible) showLayers();
      else hideLayers();
    });
  }

  if (languageControlsEnabled) {
    ui.languageBtn.addEventListener("click", () => {
      tryHideLayers();
      languageMenuVisible ? hideLanguageMenu() : showLanguageMenu();
    });
  }

  if (infoControlsEnabled) {
    ui.infoBtn.addEventListener("click", () => {
      hideLanguageMenu();
      tryHideLayers();
      overlay.close();
      openInfoPage(activeInfoPage);
    });
  }

  ui.infoOverlayClose.addEventListener("click", closeInfoOverlay);

  if (layersControlsEnabled) {
    ui.toggleImageOverlayBtn.addEventListener("click", () => {
      hideLanguageMenu();
      if (imageOverlayVisible) {
        map.removeLayer(imageOverlay);
        imageOverlayVisible = false;
        ui.toggleImageOverlayBtn.classList.remove("is-active");
      } else {
        imageOverlay.addTo(map);
        map.setZoom(12);
        imageOverlayVisible = true;
        ui.toggleImageOverlayBtn.classList.add("is-active");
      }
      updateLayerSubtitles();
    });
  }

  if (layersControlsEnabled) {
    ui.styleToggleBtn.addEventListener("click", () => {
      hideLanguageMenu();
      if (currentBaseLayer === "minimalist") {
        map.removeLayer(minimalistLayer);
        detailedLayer.addTo(map);
        currentBaseLayer = "detailed";
        ui.styleToggleBtn.classList.add("is-active");
      } else {
        map.removeLayer(detailedLayer);
        minimalistLayer.addTo(map);
        currentBaseLayer = "minimalist";
        ui.styleToggleBtn.classList.remove("is-active");
      }
      updateLayerSubtitles();
    });
  }

  function onMapBackgroundInteraction() {
    hideLanguageMenu();
    tryHideLayers();
  }

  map.getContainer().addEventListener("mousedown", onMapBackgroundInteraction, { passive: true });
  map.getContainer().addEventListener("touchstart", onMapBackgroundInteraction, { passive: true });

  if (languageControlsEnabled) {
    document.addEventListener("click", (event) => {
      if (!languageMenuVisible) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (ui.languageBtn.contains(target) || ui.languageMenu.contains(target)) return;
      hideLanguageMenu();
    });
  }

  const poiLayer = createPoiLayer({
    map,
    overlay,
    labelZoomThreshold: 19,
    dotZoomThreshold: isMobileViewport ? 17 : 16,
    labelMaxLength: 24,
    translate: (key, fallback, vars) => t(key, fallback, vars)
  });

  loadAllPois()
    .then((pois) => poiLayer.setPois(pois))
    .catch((err) => console.error("POI load failed:", err));

  document.addEventListener("poi:complete-changed", () => poiLayer.updateIcons());

  ui.centerBtn.addEventListener("click", () => {
    hideLanguageMenu();
    map.setView(center, cityCenterZoom);
    tryHideLayers();
  });

  let isRequestInFlight = false;
  let hasLocationPermission = false;
  let userMarker = null;
  let deviceHeading = null;
  let orientationTrackingStarted = false;
  let bannerState = "hidden";
  let bannerMessageKey = null;

  function hideLocationBanner() {
    bannerState = "hidden";
    bannerMessageKey = null;
    ui.locationBanner.classList.add("banner-hidden");
    ui.locationBanner.classList.remove("banner-notice");
  }

  function refreshLocationBanner() {
    if (bannerState === "hidden") return;

    ui.dismissBannerBtn.textContent = t("app.location.dismiss", "Dismiss");
    ui.grantLocationBtn.textContent = isRequestInFlight
      ? t("app.location.requesting", "Requesting...")
      : t("app.location.allow", "Allow location");

    if (bannerState === "prompt") {
      ui.bannerText.textContent = t("app.location.prompt", "Allow location access to use My Location.");
      return;
    }

    if (bannerState === "notice") {
      ui.bannerText.textContent = t(
        bannerMessageKey || "app.location.failed",
        "Location access failed. You can try again from your browser settings."
      );
    }
  }

  function showLocationPrompt() {
    bannerState = "prompt";
    bannerMessageKey = null;
    ui.grantLocationBtn.classList.remove("banner-btn-hidden");
    ui.grantLocationBtn.disabled = isRequestInFlight;
    ui.dismissBannerBtn.classList.remove("banner-btn-hidden");
    ui.locationBanner.classList.remove("banner-hidden", "banner-notice");
    refreshLocationBanner();
  }

  function showLocationNotice(messageKey) {
    bannerState = "notice";
    bannerMessageKey = messageKey;
    ui.grantLocationBtn.classList.add("banner-btn-hidden");
    ui.grantLocationBtn.disabled = false;
    ui.dismissBannerBtn.classList.remove("banner-btn-hidden");
    ui.locationBanner.classList.remove("banner-hidden");
    ui.locationBanner.classList.add("banner-notice");
    refreshLocationBanner();
  }

  function enableMyLocation() {
    hasLocationPermission = true;
    ui.myLocationBtn.disabled = false;
  }

  function disableMyLocation() {
    hasLocationPermission = false;
    ui.myLocationBtn.disabled = true;
  }

  function normalizeHeading(heading) {
    if (!Number.isFinite(heading)) return null;
    let normalized = heading % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
  }

  function setUserMarkerHeading(heading) {
    if (!userMarker) return;
    const markerEl = userMarker.getElement();
    if (!markerEl) return;
    const headingEl = markerEl.querySelector(".user-heading");
    if (!headingEl) return;

    const normalizedHeading = normalizeHeading(heading);
    if (normalizedHeading === null) {
      headingEl.classList.remove("has-heading");
      headingEl.style.removeProperty("--heading");
      return;
    }

    headingEl.style.setProperty("--heading", normalizedHeading.toString());
    headingEl.classList.add("has-heading");
  }

  function onDeviceOrientation(event) {
    if (Number.isFinite(event.webkitCompassHeading)) {
      deviceHeading = event.webkitCompassHeading;
    } else if (Number.isFinite(event.alpha)) {
      deviceHeading = (360 - event.alpha) % 360;
    } else {
      return;
    }

    if (userMarker) setUserMarkerHeading(deviceHeading);
  }

  function startOrientationTracking() {
    if (!isMobileViewport || orientationTrackingStarted) return;
    if (typeof window.DeviceOrientationEvent === "undefined") return;

    const attach = () => {
      window.addEventListener("deviceorientation", onDeviceOrientation, true);
      orientationTrackingStarted = true;
    };

    if (typeof window.DeviceOrientationEvent.requestPermission === "function") {
      window.DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === "granted") attach();
        })
        .catch(() => {
          // User denied or browser blocked permission.
        });
      return;
    }

    attach();
  }

  function resolveHeading(positionHeading) {
    const normalizedPositionHeading = normalizeHeading(positionHeading);
    if (normalizedPositionHeading !== null) return normalizedPositionHeading;
    return normalizeHeading(deviceHeading);
  }

  function makeUserMarkerIcon() {
    return L.divIcon({
      className: "user-heading-icon",
      html: '<div class="user-heading"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
  }

  function updateUserMarker(latlng, heading = null) {
    if (!userMarker) {
      userMarker = L.marker(latlng, {
        icon: makeUserMarkerIcon(),
        keyboard: false,
        interactive: false
      }).addTo(map);
      setUserMarkerHeading(heading);
      return;
    }
    userMarker.setLatLng(latlng);
    setUserMarkerHeading(heading);
  }

  function permissionErrorKey(error) {
    if (!error || typeof error.code !== "number") return "app.location.failed";
    if (error.code === error.PERMISSION_DENIED) return "app.location.denied";
    if (error.code === error.POSITION_UNAVAILABLE) return "app.location.unavailable";
    if (error.code === error.TIMEOUT) return "app.location.timeout";
    return "app.location.failed";
  }

  function requestLocationPermission() {
    if (!navigator.geolocation || isRequestInFlight) return;
    isRequestInFlight = true;
    ui.grantLocationBtn.disabled = true;
    refreshLocationBanner();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        isRequestInFlight = false;
        enableMyLocation();
        hideLocationBanner();
        startOrientationTracking();
        updateUserMarker(
          L.latLng(position.coords.latitude, position.coords.longitude),
          resolveHeading(position.coords.heading)
        );
      },
      (error) => {
        isRequestInFlight = false;
        disableMyLocation();
        showLocationNotice(permissionErrorKey(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  ui.grantLocationBtn.addEventListener("click", requestLocationPermission);
  ui.dismissBannerBtn.addEventListener("click", hideLocationBanner);

  ui.myLocationBtn.addEventListener("click", () => {
    hideLanguageMenu();
    closeInfoOverlay();
    tryHideLayers();
    startOrientationTracking();

    if (!hasLocationPermission) {
      showLocationPrompt();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
        updateUserMarker(latlng, resolveHeading(position.coords.heading));
        map.setView(latlng, Math.max(map.getZoom(), 17));
      },
      (error) => {
        showLocationNotice(permissionErrorKey(error));
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
    showLocationNotice("app.location.notSupported");
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

  applyStaticTranslations();
  if (!languageControlsEnabled) {
    languageMenuVisible = false;
    hideLanguageMenu();
    ui.languageBtn.style.display = "none";
    ui.languageMenu.style.display = "none";
  }
  if (!layersControlsEnabled) {
    layersVisible = false;
    hideLayers();
    ui.layersBanner.style.display = "none";
    ui.layersShowBtn.style.display = "none";
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!ui.infoOverlay.classList.contains("poi-overlay-hidden")) closeInfoOverlay();
    if (languageMenuVisible) hideLanguageMenu();
  });

  return {
    map,
    overlay,
    center
  };
}

