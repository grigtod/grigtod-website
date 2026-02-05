export function createPoiLayer({
  map,
  overlay,
  labelZoomThreshold = 18
}) {
  if (!map) throw new Error("createPoiLayer requires map");
  if (!overlay) throw new Error("createPoiLayer requires overlay");

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

  function updateIcons() {
    const showLabel = map.getZoom() >= labelZoomThreshold;
    for (const { poi, marker } of poiMarkers) {
      marker.setIcon(makePoiIcon(poi, showLabel));
    }
  }

  function setPois(pois) {
    // remove old markers if reloading
    for (const { marker } of poiMarkers) map.removeLayer(marker);
    poiMarkers = [];

    poiMarkers = pois.map((poi) => {
      const marker = L.marker([poi.lat, poi.lon], {
        icon: makePoiIcon(poi, map.getZoom() >= labelZoomThreshold),
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

    updateIcons();
  }

  // keep labels in sync with zoom
  map.on("zoomend", updateIcons);

  return {
    setPois,
    updateIcons
  };
}
