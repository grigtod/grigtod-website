import { createThreeScene } from "./threeScene.js";
import { createCesiumGlobe } from "./cesiumGlobe.js";
import { wireMenu } from "./menu.js";

let three;
let cesium;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function syncCesiumToThree() {
  if (!three || !cesium) return;

  const offset = three.camera.position.clone().sub(three.controls.target);
  const spherical = new three.THREE.Spherical().setFromVector3(offset);

  const heading = spherical.theta;
  const pitch = spherical.phi - Math.PI / 2;

  const range = clamp(spherical.radius * 2500000, 4000000, 50000000);

  const eps = 0.02;
  const clampedPitch = clamp(pitch, -Cesium.Math.PI_OVER_TWO + eps, Cesium.Math.PI_OVER_TWO - eps);

  cesium.setCameraFromHeadingPitchRange({
    heading,
    pitch: clampedPitch,
    range
  });
}

function buildCesiumActions() {
  return {
    seabed2030() {
      const v = cesium.viewer;
      v.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0a567a");
      v.entities.removeAll();

      for (let i = 0; i < 40; i++) {
        const lon = -40 + Math.random() * 120;
        const lat = -35 + Math.random() * 70;
        v.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat),
          point: {
            pixelSize: 5,
            color: Cesium.Color.CYAN.withAlpha(0.85),
            outlineColor: Cesium.Color.WHITE.withAlpha(0.35),
            outlineWidth: 1
          }
        });
      }

      v.scene.requestRender();
      console.log("Seabed 2030 action fired");
    },

    globalforestwatch() {
      const v = cesium.viewer;
      v.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0c3b1e");
      v.entities.removeAll();

      v.entities.add({
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(-75, -20, -45, 5),
          material: Cesium.Color.LIME.withAlpha(0.18),
          outline: true,
          outlineColor: Cesium.Color.LIME.withAlpha(0.6)
        }
      });

      v.scene.requestRender();
      console.log("Global Forest Watch action fired");
    },

    climateTemperature() {
      const v = cesium.viewer;
      v.scene.globe.baseColor = Cesium.Color.fromCssColorString("#3b0b0b");
      v.entities.removeAll();

      const bands = [
        { south: -10, north: 10, color: Cesium.Color.RED.withAlpha(0.14) },
        { south: 10, north: 25, color: Cesium.Color.ORANGE.withAlpha(0.12) },
        { south: -25, north: -10, color: Cesium.Color.ORANGE.withAlpha(0.12) },
        { south: 25, north: 45, color: Cesium.Color.YELLOW.withAlpha(0.10) },
        { south: -45, north: -25, color: Cesium.Color.YELLOW.withAlpha(0.10) }
      ];

      for (const b of bands) {
        v.entities.add({
          rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(-180, b.south, 180, b.north),
            material: b.color,
            outline: false
          }
        });
      }

      v.scene.requestRender();
      console.log("Climate Temperature action fired");
    }
  };
}

function onResize() {
  if (three) three.resize();
  if (cesium) cesium.resize();
}

function animate() {
  requestAnimationFrame(animate);
  if (three) three.renderFrame();
  if (cesium) cesium.renderFrame();
}

function start() {
  three = createThreeScene({
    canvasId: "threeCanvas",
    stageId: "stageWrap",
    onControlsChange: syncCesiumToThree
  });

  cesium = createCesiumGlobe({ containerId: "cesiumContainer" });

  syncCesiumToThree();

  wireMenu({
    gridId: "menuGrid",
    actions: buildCesiumActions()
  });

  window.addEventListener("resize", onResize, { passive: true });
  onResize();
  animate();
}

start();
