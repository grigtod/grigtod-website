// app.js
import { createMap } from "./map.js";

function byId(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

function qs(sel) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Missing element ${sel}`);
  return el;
}

document.addEventListener("DOMContentLoaded", () => {
  // If your UI elements are IDs, use byId.
  // If they are classes, use qs.
  // Replace these selectors to match your HTML.

  const ui = {
    poiOverlay: qs("#poiOverlay"),
    poiOverlayFrame: qs("#poiOverlayFrame"),
    poiOverlayClose: qs("#poiOverlayClose"),

    poiCompleteBtn: qs("#poiCompleteBtn"),
    poiCompleteLabel: qs("#poiCompleteLabel"),

    bannerText: qs("#bannerText"),
    locationBanner: qs("#locationBanner"),

    layersBanner: qs("#layersBanner"),
    myLocationBtn: qs("#myLocationBtn"),
    centerBtn: qs("#centerBtn"),
    dismissBannerBtn: qs("#dismissBannerBtn"),
    layersShowBtn: qs("#layersShowBtn"),

    toggleImageOverlayBtn: qs("#toggleImageOverlayBtn"),
    styleToggleBtn: qs("#styleToggleBtn")
  };

  const api = createMap({
    mapElId: "map",
    ui
  });

  // Example: if another module needs access to the Leaflet map instance
  // you can pass api.map to it here instead of using window.map.
  // initSomethingElse({ map: api.map });

  // Example: if you need the currently selected POI from app.js:
  // console.log("Selected POI:", api.getCurrentlySelectedPOI());
});
