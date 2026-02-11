import { createMap } from "./map.js";

function id(name) {
  const el = document.getElementById(name);
  if (!el) throw new Error(`Missing element with id="${name}"`);
  return el;
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = {
    // overlay
    poiOverlay: id("poiOverlay"),
    poiOverlayFrame: id("poiOverlayFrame"),
    poiOverlayClose: id("poiOverlayClose"),
    poiCompleteBtn: id("poiCompleteBtn"),
    poiCompleteLabel: id("poiCompleteLabel"),

    // banners
    locationBanner: id("locationBanner"),
    bannerText: id("bannerText"),
    layersBanner: id("layersBanner"),

    // buttons
    myLocationBtn: id("myLocationBtn"),
    centerBtn: id("centerBtn"),
    grantLocationBtn: id("grantLocationBtn"),
    dismissBannerBtn: id("dismissBannerBtn"),
    layersShowBtn: id("layersShowBtn"),
    styleToggleBtn: id("styleToggleBtn"),
    toggleImageOverlayBtn: id("toggleImageOverlayBtn")
  };

  const api = createMap({
    mapElId: "map",
    ui
  });

  // If you ever need access from the console while debugging:
  // window.__mapApi = api;
});
