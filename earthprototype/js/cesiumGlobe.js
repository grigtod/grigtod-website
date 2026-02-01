export function createCesiumGlobe({ containerId }) {
  const container = document.getElementById(containerId);

  const viewer = new Cesium.Viewer(container, {
    imageryProvider: new Cesium.OpenStreetMapImageryProvider(),
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false,
    shouldAnimate: false,
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    contextOptions: {
      webgl: {
        alpha: true,
        preserveDrawingBuffer: true
      }
    }
  });

  viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;
  viewer.scene.skyBox = undefined;
  viewer.scene.sun.show = false;
  viewer.scene.moon.show = false;
  viewer.scene.globe.showGroundAtmosphere = true;
  viewer.scene.skyAtmosphere.show = false; 
  viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 2.0);

  const ssc = viewer.scene.screenSpaceCameraController;
  ssc.enableRotate = false;
  ssc.enableTranslate = false;
  ssc.enableZoom = false;
  ssc.enableTilt = false;
  ssc.enableLook = false;

  const targetCartographic = Cesium.Cartographic.fromDegrees(0, 0, 0);
  let rangeMeters = 22000000;

  function setCameraFromHeadingPitchRange({ heading, pitch, range }) {
    // Enforce sensible pitch limits so the globe doesn't tilt to ±90°
    const PITCH_MIN = -Math.PI / 4; // -45°
    const PITCH_MAX = Math.PI / 4;  // +45°

    const clampedPitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitch));

    rangeMeters = rangeMeters = range;
    const target = Cesium.Cartesian3.fromRadians(
      targetCartographic.longitude,
      targetCartographic.latitude,
      targetCartographic.height
    );
    viewer.camera.lookAt(target, new Cesium.HeadingPitchRange(heading, clampedPitch, range));
    viewer.scene.requestRender();
  }

  // Apply a Cesium Ion token and switch to Cesium World Imagery
  function applyIonKey(token) {
    if (!token) return;
    try {
      Cesium.Ion.defaultAccessToken = token;
      // Replace imagery with Cesium World Imagery (Ion) using the IonImageryProvider
      try {
        viewer.imageryLayers.removeAll();
      } catch (e) {
        // ignore
      }

      // Cesium World Imagery asset id on Ion
      const WORLD_IMAGERY_ASSET_ID = 3845;
      let provider = null;

      // Prefer IonImageryProvider when available
      if (typeof Cesium.IonImageryProvider === 'function') {
        try {
          provider = new Cesium.IonImageryProvider({ assetId: WORLD_IMAGERY_ASSET_ID });
        } catch (e) {
          provider = null;
        }
      }

      // Fallback to createWorldImagery if present
      if (!provider && typeof Cesium.createWorldImagery === 'function') {
        try {
          provider = Cesium.createWorldImagery();
        } catch (e) {
          provider = null;
        }
      }

      if (provider) {
        const addProviderLayer = () => {
          try {
            const layer = new Cesium.ImageryLayer(provider);
            viewer.imageryLayers.add(layer);
            viewer.scene.requestRender();
          } catch (e) {
            try {
              viewer.imageryLayers.addImageryProvider(provider);
              viewer.scene.requestRender();
            } catch (err) {
              console.error('Failed to add imagery provider:', err, e);
            }
          }
        };

        if (provider.readyPromise && typeof provider.readyPromise.then === 'function') {
          provider.readyPromise.then(() => {
            addProviderLayer();
          }).catch((err) => {
            console.error('Imagery provider readyPromise rejected:', err);
            // Fallback to ArcGIS World Imagery
            try {
              const arc = new Cesium.ArcGisMapServerImageryProvider({
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
              });
              arc.readyPromise.then(() => {
                try {
                  const layer = new Cesium.ImageryLayer(arc);
                  viewer.imageryLayers.add(layer);
                  viewer.scene.requestRender();
                } catch (e2) {
                  console.error('ArcGIS fallback add failed:', e2);
                }
              }).catch((e3) => console.error('ArcGIS fallback ready failed:', e3));
            } catch (e) {
              console.error('ArcGIS fallback failed:', e);
            }
          });
        } else {
          addProviderLayer();
        }
      } else {
        console.warn('No compatible Cesium imagery provider available in this build.');
      }
    } catch (err) {
      console.error('Failed to apply Ion token', err);
    }
  }

  function resize() {
    viewer.resize();
    viewer.scene.requestRender();
  }

  function renderFrame() {
    viewer.render();
  }

  return { viewer, targetCartographic, get rangeMeters() { return rangeMeters; }, setCameraFromHeadingPitchRange, applyIonKey, resize, renderFrame };
}
