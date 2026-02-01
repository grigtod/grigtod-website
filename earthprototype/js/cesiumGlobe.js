export function createCesiumGlobe({ containerId }) {
  const container = document.getElementById(containerId);

  const viewer = new Cesium.Viewer(container, {
    imageryProvider: new Cesium.OpenStreetMapImageryProvider({
      url: "https://a.tile.openstreetmap.org/"
    }),
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
    maximumRenderTimeChange: Infinity
  });

  viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;
  viewer.scene.skyBox = undefined;
  viewer.scene.sun.show = false;
  viewer.scene.moon.show = false;
  viewer.scene.globe.showGroundAtmosphere = true;

  const ssc = viewer.scene.screenSpaceCameraController;
  ssc.enableRotate = false;
  ssc.enableTranslate = false;
  ssc.enableZoom = false;
  ssc.enableTilt = false;
  ssc.enableLook = false;

  const targetCartographic = Cesium.Cartographic.fromDegrees(15, 5, 0);
  let rangeMeters = 22000000;

  function setCameraFromHeadingPitchRange({ heading, pitch, range }) {
    rangeMeters = rangeMeters = range;
    const target = Cesium.Cartesian3.fromRadians(
      targetCartographic.longitude,
      targetCartographic.latitude,
      targetCartographic.height
    );
    viewer.camera.lookAt(target, new Cesium.HeadingPitchRange(heading, pitch, range));
    viewer.scene.requestRender();
  }

  function resize() {
    viewer.resize();
    viewer.scene.requestRender();
  }

  function renderFrame() {
    viewer.render();
  }

  return { viewer, targetCartographic, get rangeMeters() { return rangeMeters; }, setCameraFromHeadingPitchRange, resize, renderFrame };
}
