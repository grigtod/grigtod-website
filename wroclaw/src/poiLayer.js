export function createPoiLayer({
  map,
  overlay,
  labelZoomThreshold = 18,
  dotZoomThreshold = 16,
  labelMaxLength = 24,
  translate = (_key, fallback) => fallback
}) {
  if (!map) throw new Error("createPoiLayer requires map");
  if (!overlay) throw new Error("createPoiLayer requires overlay");

  let poiMarkers = [];

  function getDotColor() {
    return "#16a34a";
  }

  function escapeHtml(input) {
    return String(input)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function translatedLabel(poi) {
    if (!poi?.labelKey) return poi?.label ?? "";
    return translate(poi.labelKey, poi.label ?? "");
  }

  function truncateLabel(label) {
    const normalized = String(label ?? "").trim();
    if (normalized.length <= labelMaxLength) return normalized;
    return `${normalized.slice(0, Math.max(0, labelMaxLength - 3)).trim()}...`;
  }

  function makePoiIcon(poi, zoomLevel) {
    const fullLabel = translatedLabel(poi);
    const displayLabel = truncateLabel(fullLabel);
    const safeAriaLabel = escapeHtml(fullLabel);
    const safeDisplayLabel = escapeHtml(displayLabel);

    const isCompleted = overlay.isCompleted(poi.id);
    const showLabel = zoomLevel >= labelZoomThreshold;
    const showDotOnly = zoomLevel < dotZoomThreshold;

    const classNameParts = ["poi-marker"];
    if (showLabel) classNameParts.push("show-label");
    if (isCompleted) classNameParts.push("is-completed");

    const markerVisual = showDotOnly
      ? `<span class="poi-dot" style="--poi-dot-color: ${getDotColor()}" aria-hidden="true"></span>`
      : poi.iconUrl
        ? `<img class="poi-image" src="${escapeHtml(poi.iconUrl)}" alt="" aria-hidden="true">`
        : `<span class="poi-emoji">${poi.emoji}</span>`;

    const html = `
      <div class="${classNameParts.join(" ")}" role="button" aria-label="${safeAriaLabel}">
        ${markerVisual}
        <span class="poi-label">${safeDisplayLabel}</span>
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
        const key = e.originalEvent?.key;
        if (key === "Enter" || key === " ") {
          overlay.open({ url: poi.embedUrl, poiId: poi.id });
        }
      });

      return { poi, marker };
    });

    updateIcons();
  }

  map.on("zoomend", updateIcons);

  return {
    setPois,
    updateIcons
  };
}

