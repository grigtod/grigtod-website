import { createThreeScene } from "./threeScene.js";
import { wireMenu } from "./menu.js";

let three;

function onResize() {
  if (three) three.resize();
}

function animate() {
  requestAnimationFrame(animate);
  if (three) three.renderFrame();
}

function buildGlobeActions() {
  return {
    seabed2030() {
      three?.setOverlay("seabed2030");
    },
    globalforestwatch() {
      three?.setOverlay("globalforestwatch");
    },
    climateTemperature() {
      three?.setOverlay("climateTemperature");
    }
  };
}

function start() {
  three = createThreeScene({
    canvasId: "threeCanvas",
    stageId: "stageWrap"
  });

  wireMenu({
    gridId: "menuGrid",
    actions: buildGlobeActions()
  });

  window.addEventListener("resize", onResize, { passive: true });
  onResize();
  animate();
}

start();
