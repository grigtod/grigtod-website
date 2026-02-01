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
    async function applyIonKey(token) {
  if (!token) return;

  Cesium.Ion.defaultAccessToken = token;

  // Clear existing imagery
  viewer.imageryLayers.removeAll();

  let provider;

  try {
    // Use Cesium's default global imagery for the token
    provider = await Cesium.createWorldImageryAsync();
    viewer.imageryLayers.addImageryProvider(provider);
  } catch (err) {
    console.error("ion imagery failed, falling back:", err);

    // Fallback that does not require ion at all
    provider = new Cesium.OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org/"
    });
    viewer.imageryLayers.addImageryProvider(provider);
  }

  viewer.scene.requestRender();
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
