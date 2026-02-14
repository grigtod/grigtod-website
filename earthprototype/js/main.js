import { createThreeScene } from "./threeScene.js";
import { wireMenu } from "./menu.js";

let three;

function setupCreditsPanel() {
  const toggle = document.getElementById("creditsToggle");
  const panel = document.getElementById("creditsPanel");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    panel.setAttribute("aria-hidden", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}
function onResize() {
  if (three) three.resize();
}

function animate() {
  requestAnimationFrame(animate);
  if (three) three.renderFrame();
}

function buildGlobeActions() {
  return {
    none() {
      three?.setOverlay("none");
    },
    seabed2030() {
      three?.setOverlay("seabed2030");
    },
    globalforestwatch() {
      three?.setOverlay("globalforestwatch");
    },
    climateTemperature() {
      three?.setOverlay("climateTemperature");
    },
    wind() {
      three?.setOverlay("wind");
    },
    clouds() {
      three?.setOverlay("clouds");
    },
    precipitation() {
      three?.setOverlay("precipitation");
    },
    seaSurfaceTemperature() {
      three?.setOverlay("seaSurfaceTemperature");
    },
    urbanLights() {
      three?.setOverlay("urbanLights");
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
    actions: buildGlobeActions(),
    initialActiveAction: "none"
  });

  setupCreditsPanel();

  window.addEventListener("resize", onResize, { passive: true });
  onResize();
  animate();
}

start();

