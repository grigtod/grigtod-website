export function createPoiLayer({
  map,
  overlay,
  labelZoomThreshold = 18,
  dotZoomThreshold = 16
}) {
  if (!map) throw new Error("createPoiLayer requires map");
  if (!overlay) throw new Error("createPoiLayer requires overlay");

  let poiMarkers = [];

  function getDotColor(emoji) {
    const colorsByEmoji = {
      "📷": "#d9480f",
      "🗿": "#495057",
      "ℹ️": "#1971c2",
      "🏛️": "#5f3dc4",
      "⛏️": "#2b8a3e"
    };

    return colorsByEmoji[emoji] ?? "#0078ff";
  }

  function makePoiIcon({ emoji, label, id }, zoomLevel) {
    const safeLabel = String(label)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

    const isCompleted = overlay.isCompleted(id);
    const showLabel = zoomLevel >= labelZoomThreshold;
    const showDotOnly = zoomLevel < dotZoomThreshold;

    const classNameParts = ["poi-marker"];
    if (showLabel) classNameParts.push("show-label");
    if (isCompleted) classNameParts.push("is-completed");

    const markerVisual = showDotOnly
      ? `<span class="poi-dot" style="--poi-dot-color: ${getDotColor(emoji)}" aria-hidden="true"></span>`
      : `<span class="poi-emoji">${emoji}</span>`;

    const html = `
      <div class="${classNameParts.join(" ")}" role="button" aria-label="${safeLabel}">
        ${markerVisual}
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
    const zoomLevel = map.getZoom();
    for (const { poi, marker } of poiMarkers) {
      marker.setIcon(makePoiIcon(poi, zoomLevel));
    }
  }

  function setPois(pois) {
    // remove old markers if reloading
    for (const { marker } of poiMarkers) map.removeLayer(marker);
    poiMarkers = [];

    poiMarkers = pois.map((poi) => {
      const marker = L.marker([poi.lat, poi.lon], {
        icon: makePoiIcon(poi, map.getZoom()),
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
