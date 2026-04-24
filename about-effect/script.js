const baseImagePath = "images/me.jpg";
const variantImages = [
  "images/actionFigure.jpg",
  "images/clay.jpg",
  "images/duck.jpg",
  "images/familyGuy.jpg",
  "images/funko.jpg",
  "images/lego.jpg",
  "images/littlePeople.jpg",
  "images/pixar.jpg",
  "images/pixelart.jpg",
  "images/potato.jpg",
  "images/puppet.jpg",
  "images/simpsons.jpg",
  "images/tintin.jpg",
  "images/winduprobot.jpg",
];

const stage = document.getElementById("avatar-stage");
const baseImage = document.getElementById("base-image");
const fullVariantImage = document.getElementById("full-variant-image");
const variantImage = document.getElementById("variant-image");
const blobShapes = document.getElementById("blob-shapes");
const modeSelect = document.getElementById("mode-select");
const modeControlGroups = Array.from(document.querySelectorAll("[data-mode-controls]"));

const blobSizeSlider = document.getElementById("blob-size-slider");
const blobSizeValue = document.getElementById("blob-size-value");
const blobWobbleSlider = document.getElementById("blob-wobble-slider");
const blobWobbleValue = document.getElementById("blob-wobble-value");

const liquidSpreadSlider = document.getElementById("liquid-spread-slider");
const liquidSpreadValue = document.getElementById("liquid-spread-value");
const liquidTurbulenceSlider = document.getElementById("liquid-turbulence-slider");
const liquidTurbulenceValue = document.getElementById("liquid-turbulence-value");
const liquidSpeedSlider = document.getElementById("liquid-speed-slider");
const liquidSpeedValue = document.getElementById("liquid-speed-value");

const pixelSizeSlider = document.getElementById("pixel-size-slider");
const pixelSizeValue = document.getElementById("pixel-size-value");
const pixelScatterSlider = document.getElementById("pixel-scatter-slider");
const pixelScatterValue = document.getElementById("pixel-scatter-value");
const pixelSpeedSlider = document.getElementById("pixel-speed-slider");
const pixelSpeedValue = document.getElementById("pixel-speed-value");

const heatIntensitySlider = document.getElementById("heat-intensity-slider");
const heatIntensityValue = document.getElementById("heat-intensity-value");
const heatRadiusSlider = document.getElementById("heat-radius-slider");
const heatRadiusValue = document.getElementById("heat-radius-value");
const heatDriftSlider = document.getElementById("heat-drift-slider");
const heatDriftValue = document.getElementById("heat-drift-value");

const spotlightSizeSlider = document.getElementById("spotlight-size-slider");
const spotlightSizeValue = document.getElementById("spotlight-size-value");
const spotlightSoftnessSlider = document.getElementById("spotlight-softness-slider");
const spotlightSoftnessValue = document.getElementById("spotlight-softness-value");
const spotlightSpeedSlider = document.getElementById("spotlight-speed-slider");
const spotlightSpeedValue = document.getElementById("spotlight-speed-value");

const halftoneSizeSlider = document.getElementById("halftone-size-slider");
const halftoneSizeValue = document.getElementById("halftone-size-value");
const halftoneCoverageSlider = document.getElementById("halftone-coverage-slider");
const halftoneCoverageValue = document.getElementById("halftone-coverage-value");
const halftoneSpeedSlider = document.getElementById("halftone-speed-slider");
const halftoneSpeedValue = document.getElementById("halftone-speed-value");

const magnetStrengthSlider = document.getElementById("magnet-strength-slider");
const magnetStrengthValue = document.getElementById("magnet-strength-value");
const magnetRadiusSlider = document.getElementById("magnet-radius-slider");
const magnetRadiusValue = document.getElementById("magnet-radius-value");
const magnetTrailSlider = document.getElementById("magnet-trail-slider");
const magnetTrailValue = document.getElementById("magnet-trail-value");

const glitchChaosSlider = document.getElementById("glitch-chaos-slider");
const glitchChaosValue = document.getElementById("glitch-chaos-value");
const glitchRateSlider = document.getElementById("glitch-rate-slider");
const glitchRateValue = document.getElementById("glitch-rate-value");

const hoverTransitionSlider = document.getElementById("hover-transition-slider");
const hoverTransitionValue = document.getElementById("hover-transition-value");
const hoverZoomSlider = document.getElementById("hover-zoom-slider");
const hoverZoomValue = document.getElementById("hover-zoom-value");

const intervalSlider = document.getElementById("interval-slider");
const intervalValue = document.getElementById("interval-value");
const timedJoltSlider = document.getElementById("timed-jolt-slider");
const timedJoltValue = document.getElementById("timed-jolt-value");

const shaderFrequencySlider = document.getElementById("shader-frequency-slider");
const shaderFrequencyValue = document.getElementById("shader-frequency-value");
const shaderAmountSlider = document.getElementById("shader-amount-slider");
const shaderAmountValue = document.getElementById("shader-amount-value");

const glitchImages = [0, 1, 2].map((index) => document.getElementById(`glitch-image-${index}`));

if (
  !stage ||
  !baseImage ||
  !fullVariantImage ||
  !variantImage ||
  !blobShapes ||
  !modeSelect ||
  !blobSizeSlider ||
  !blobSizeValue ||
  !blobWobbleSlider ||
  !blobWobbleValue ||
  !liquidSpreadSlider ||
  !liquidSpreadValue ||
  !liquidTurbulenceSlider ||
  !liquidTurbulenceValue ||
  !liquidSpeedSlider ||
  !liquidSpeedValue ||
  !pixelSizeSlider ||
  !pixelSizeValue ||
  !pixelScatterSlider ||
  !pixelScatterValue ||
  !pixelSpeedSlider ||
  !pixelSpeedValue ||
  !heatIntensitySlider ||
  !heatIntensityValue ||
  !heatRadiusSlider ||
  !heatRadiusValue ||
  !heatDriftSlider ||
  !heatDriftValue ||
  !spotlightSizeSlider ||
  !spotlightSizeValue ||
  !spotlightSoftnessSlider ||
  !spotlightSoftnessValue ||
  !spotlightSpeedSlider ||
  !spotlightSpeedValue ||
  !halftoneSizeSlider ||
  !halftoneSizeValue ||
  !halftoneCoverageSlider ||
  !halftoneCoverageValue ||
  !halftoneSpeedSlider ||
  !halftoneSpeedValue ||
  !magnetStrengthSlider ||
  !magnetStrengthValue ||
  !magnetRadiusSlider ||
  !magnetRadiusValue ||
  !magnetTrailSlider ||
  !magnetTrailValue ||
  !glitchChaosSlider ||
  !glitchChaosValue ||
  !glitchRateSlider ||
  !glitchRateValue ||
  !hoverTransitionSlider ||
  !hoverTransitionValue ||
  !hoverZoomSlider ||
  !hoverZoomValue ||
  !intervalSlider ||
  !intervalValue ||
  !timedJoltSlider ||
  !timedJoltValue ||
  !shaderFrequencySlider ||
  !shaderFrequencyValue ||
  !shaderAmountSlider ||
  !shaderAmountValue ||
  glitchImages.some((image) => !image)
) {
  throw new Error("Blobby avatar setup is missing required DOM nodes.");
}

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";
const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 125;

const pointer = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 };
const targetPointer = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 };
const liquidOrigin = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 };
const liquidFocus = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 };
const pixelOrigin = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 };
const halftoneOrigin = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 };

const primaryBlobTemplates = [
  { rx: 28, ry: 22.5, angle: 12, drift: 0.015, wobble: 2.4, orbit: 0 },
  { rx: 22, ry: 17.8, angle: -18, drift: 0.021, wobble: 2.1, orbit: 12.5 },
  { rx: 17.4, ry: 14.2, angle: 34, drift: 0.026, wobble: 1.8, orbit: 18.5 },
  { rx: 13.8, ry: 11.5, angle: -30, drift: 0.031, wobble: 1.5, orbit: 23.5 },
  { rx: 10.8, ry: 9.1, angle: 22, drift: 0.037, wobble: 1.25, orbit: 28 },
];
const particleCount = 16;

const gooBlobs = [];
const pixelCells = [];
const spotlightBeams = [];
const halftoneDots = [];
const recentVariantHistory = [];

let activeMaskMode = "";

const state = {
  mode: "blob",
  blobScale: Number(blobSizeSlider.value) / 100,
  blobEnergy: Number(blobWobbleSlider.value) / 100,
  liquidSpread: Number(liquidSpreadSlider.value) / 100,
  liquidTurbulence: Number(liquidTurbulenceSlider.value) / 100,
  liquidSpeed: Number(liquidSpeedSlider.value) / 100,
  pixelBlockSize: Number(pixelSizeSlider.value),
  pixelScatter: Number(pixelScatterSlider.value) / 100,
  pixelSpeed: Number(pixelSpeedSlider.value) / 100,
  heatIntensity: Number(heatIntensitySlider.value) / 100,
  heatRadius: Number(heatRadiusSlider.value) / 100,
  heatDrift: Number(heatDriftSlider.value) / 100,
  spotlightSize: Number(spotlightSizeSlider.value) / 100,
  spotlightSoftness: Number(spotlightSoftnessSlider.value) / 100,
  spotlightSpeed: Number(spotlightSpeedSlider.value) / 100,
  halftoneDotSize: Number(halftoneSizeSlider.value),
  halftoneCoverage: Number(halftoneCoverageSlider.value) / 100,
  halftoneSpeed: Number(halftoneSpeedSlider.value) / 100,
  magnetStrength: Number(magnetStrengthSlider.value) / 100,
  magnetRadius: Number(magnetRadiusSlider.value) / 100,
  magnetTrail: Number(magnetTrailSlider.value) / 100,
  glitchChaos: Number(glitchChaosSlider.value) / 100,
  glitchRate: Number(glitchRateSlider.value) / 100,
  hoverTransition: Number(hoverTransitionSlider.value),
  hoverZoom: Number(hoverZoomSlider.value) / 100,
  cycleInterval: Number(intervalSlider.value),
  timedJolt: Number(timedJoltSlider.value) / 100,
  shaderFrequency: Number(shaderFrequencySlider.value) / 100,
  shaderAmount: Number(shaderAmountSlider.value) / 100,
  hover: false,
  blobActive: false,
  currentVariant: variantImages[0],
  rafId: 0,
  frame: 0,
  nextTimedSwapAt: 0,
  nextBurstAt: 0,
  burstEndsAt: 0,
  timedFlashEndsAt: 0,
  liquidProgress: 0,
  liquidTarget: 0,
  pixelProgress: 0,
  pixelTarget: 0,
  spotlightProgress: 0,
  spotlightTarget: 0,
  spotlightPhase: 0,
  halftoneProgress: 0,
  halftoneTarget: 0,
};

baseImage.src = baseImagePath;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function createSvgElement(tagName) {
  return document.createElementNS(SVG_NS, tagName);
}

function pickRandomVariant(exclude = []) {
  if (variantImages.length === 0) {
    return baseImagePath;
  }

  if (variantImages.length === 1) {
    return variantImages[0];
  }

  const uniqueExcluded = new Set([state.currentVariant, ...exclude]);
  const historyWindow = Math.min(
    variantImages.length - 1,
    Math.max(3, Math.floor(variantImages.length * 0.35))
  );
  const blocked = new Set(recentVariantHistory.slice(-historyWindow));
  let available = variantImages.filter(
    (image) => !uniqueExcluded.has(image) && !blocked.has(image)
  );

  if (available.length === 0) {
    available = variantImages.filter((image) => !uniqueExcluded.has(image));
  }

  if (available.length === 0) {
    available = variantImages.filter((image) => image !== state.currentVariant);
  }

  return available[Math.floor(Math.random() * available.length)];
}

function syncVariantSource(source) {
  state.currentVariant = source;
  recentVariantHistory.push(source);
  if (recentVariantHistory.length > variantImages.length * 2) {
    recentVariantHistory.splice(0, recentVariantHistory.length - variantImages.length * 2);
  }

  fullVariantImage.src = source;
  variantImage.setAttribute("href", source);
  variantImage.setAttributeNS(XLINK_NS, "href", source);
  glitchImages.forEach((image) => {
    image.src = source;
  });
}

function updateBlobLabel() {
  blobSizeValue.textContent = formatPercent(state.blobScale);
}

function updateBlobEnergyLabel() {
  blobWobbleValue.textContent = formatPercent(state.blobEnergy);
}

function updateLiquidLabels() {
  liquidSpreadValue.textContent = formatPercent(state.liquidSpread);
  liquidTurbulenceValue.textContent = formatPercent(state.liquidTurbulence);
  liquidSpeedValue.textContent = formatPercent(state.liquidSpeed);
}

function updatePixelLabels() {
  pixelSizeValue.textContent = `${state.pixelBlockSize} px`;
  pixelScatterValue.textContent = formatPercent(state.pixelScatter);
  pixelSpeedValue.textContent = formatPercent(state.pixelSpeed);
}

function updateHeatLabels() {
  heatIntensityValue.textContent = formatPercent(state.heatIntensity);
  heatRadiusValue.textContent = formatPercent(state.heatRadius);
  heatDriftValue.textContent = formatPercent(state.heatDrift);
}

function updateSpotlightLabels() {
  spotlightSizeValue.textContent = formatPercent(state.spotlightSize);
  spotlightSoftnessValue.textContent = formatPercent(state.spotlightSoftness);
  spotlightSpeedValue.textContent = formatPercent(state.spotlightSpeed);
}

function updateHalftoneLabels() {
  halftoneSizeValue.textContent = `${state.halftoneDotSize} px`;
  halftoneCoverageValue.textContent = formatPercent(state.halftoneCoverage);
  halftoneSpeedValue.textContent = formatPercent(state.halftoneSpeed);
}

function updateMagnetLabels() {
  magnetStrengthValue.textContent = formatPercent(state.magnetStrength);
  magnetRadiusValue.textContent = formatPercent(state.magnetRadius);
  magnetTrailValue.textContent = formatPercent(state.magnetTrail);
}

function updateGlitchLabels() {
  glitchChaosValue.textContent = formatPercent(state.glitchChaos);
  glitchRateValue.textContent = formatPercent(state.glitchRate);
}

function updateHoverLabels() {
  hoverTransitionValue.textContent = `${state.hoverTransition} ms`;
  hoverZoomValue.textContent = `${Math.round(state.hoverZoom * 100)}%`;
}

function updateTimedLabels() {
  intervalValue.textContent = `${state.cycleInterval} ms`;
  timedJoltValue.textContent = formatPercent(state.timedJolt);
}

function updateShaderLabels() {
  shaderFrequencyValue.textContent = formatPercent(state.shaderFrequency);
  shaderAmountValue.textContent = formatPercent(state.shaderAmount);
}

function applyFullVariantTransition() {
  const opacityDuration = state.mode === "hover-change" ? state.hoverTransition : 180;
  const motionDuration =
    state.mode === "hover-change" ? Math.max(100, state.hoverTransition * 0.75) : 120;

  fullVariantImage.style.transition = [
    `opacity ${opacityDuration}ms ease`,
    `transform ${motionDuration}ms ease`,
    `filter ${motionDuration}ms ease`,
  ].join(", ");
}

function clearMaskShapes() {
  blobShapes.replaceChildren();
  gooBlobs.length = 0;
  pixelCells.length = 0;
  spotlightBeams.length = 0;
  halftoneDots.length = 0;
}

function createBlobElement() {
  const ellipse = createSvgElement("ellipse");
  ellipse.setAttribute("fill", "white");
  blobShapes.appendChild(ellipse);
  return ellipse;
}

function createPrimaryBlob(config) {
  return {
    type: "primary",
    x: VIEWBOX_WIDTH / 2,
    y: VIEWBOX_HEIGHT / 2,
    rx: 0,
    ry: 0,
    angle: config.angle,
    baseRx: config.rx,
    baseRy: config.ry,
    drift: config.drift,
    wobble: config.wobble,
    orbit: config.orbit,
    element: createBlobElement(),
  };
}

function resetParticle(particle, initial = false) {
  const spread = state.blobScale * (0.75 + state.blobEnergy * 0.35);
  const direction = randomBetween(0, Math.PI * 2);
  const distance = randomBetween(2.8 * spread, state.blobActive ? 11.8 * spread : 5.8 * spread);
  const speed = state.blobActive ? randomBetween(0.1, 0.42) * spread : 0;

  particle.x = pointer.x + Math.cos(direction) * distance;
  particle.y = pointer.y + Math.sin(direction) * distance;
  particle.vx = Math.cos(direction) * speed;
  particle.vy = Math.sin(direction) * speed;
  particle.life = initial ? randomBetween(0.2, 1) : 1;
  particle.decay = randomBetween(0.01, 0.022);
  particle.baseRadius = randomBetween(1.8, 4.8) * Math.max(0.9, spread * 0.88);
  particle.stretch = randomBetween(0.82, 1.22);
  particle.phase = randomBetween(0, Math.PI * 2);
  particle.spin = randomBetween(-1.8, 1.8);
  particle.angle = randomBetween(-180, 180);
}

function createParticleBlob() {
  const particle = {
    type: "particle",
    x: VIEWBOX_WIDTH / 2,
    y: VIEWBOX_HEIGHT / 2,
    rx: 0,
    ry: 0,
    angle: 0,
    vx: 0,
    vy: 0,
    life: 0,
    decay: 0.02,
    baseRadius: 2,
    stretch: 1,
    phase: 0,
    spin: 0,
    element: createBlobElement(),
  };

  resetParticle(particle, true);
  return particle;
}

function buildGooMask() {
  clearMaskShapes();
  blobShapes.setAttribute("filter", "url(#gooey-filter)");

  primaryBlobTemplates.forEach((config) => {
    gooBlobs.push(createPrimaryBlob(config));
  });

  for (let index = 0; index < particleCount; index += 1) {
    gooBlobs.push(createParticleBlob());
  }
}

function reseedPixelRanks() {
  const maxDistance = Math.hypot(VIEWBOX_WIDTH, VIEWBOX_HEIGHT);
  const scatterMix = clamp((state.pixelScatter - 0.4) / 1.8, 0, 1);

  pixelCells.forEach((cell) => {
    const centerX = cell.x + cell.size / 2;
    const centerY = cell.y + cell.size / 2;
    const distanceRatio =
      Math.hypot(centerX - pixelOrigin.x, centerY - pixelOrigin.y) / maxDistance;
    const randomRank = cell.noise * (0.55 + scatterMix * 0.6);
    cell.rank = clamp(distanceRatio * (1.08 - scatterMix * 0.48) + randomRank, 0, 1.35);
  });
}

function buildPixelMask() {
  clearMaskShapes();
  blobShapes.removeAttribute("filter");

  const cellSize = clamp(state.pixelBlockSize, 4, 24);

  for (let y = 0; y < VIEWBOX_HEIGHT; y += cellSize) {
    for (let x = 0; x < VIEWBOX_WIDTH; x += cellSize) {
      const rect = createSvgElement("rect");
      rect.setAttribute("fill", "white");
      rect.setAttribute("opacity", "0");
      blobShapes.appendChild(rect);
      pixelCells.push({
        element: rect,
        x,
        y,
        size: Math.min(cellSize + 0.2, VIEWBOX_WIDTH - x + 0.2, VIEWBOX_HEIGHT - y + 0.2),
        noise: Math.random(),
        phase: randomBetween(0, Math.PI * 2),
        rank: 1,
      });
    }
  }

  reseedPixelRanks();
}

function buildSpotlightMask() {
  clearMaskShapes();
  blobShapes.removeAttribute("filter");

  const opacities = [1, 0.7, 0.42, 0.2, 0.08];
  opacities.forEach((opacity) => {
    const ellipse = createSvgElement("ellipse");
    ellipse.setAttribute("fill", "white");
    ellipse.setAttribute("opacity", "0");
    blobShapes.appendChild(ellipse);
    spotlightBeams.push({ element: ellipse, opacity });
  });
}

function reseedHalftoneRanks() {
  const maxDistance = Math.hypot(VIEWBOX_WIDTH, VIEWBOX_HEIGHT);
  halftoneDots.forEach((dot) => {
    const distanceRatio =
      Math.hypot(dot.cx - halftoneOrigin.x, dot.cy - halftoneOrigin.y) / maxDistance;
    dot.rank = clamp(distanceRatio * 0.95 + dot.noise * 0.38, 0, 1.25);
  });
}

function buildHalftoneMask() {
  clearMaskShapes();
  blobShapes.removeAttribute("filter");

  const spacing = clamp(state.halftoneDotSize, 4, 18);

  for (let y = spacing / 2; y < VIEWBOX_HEIGHT + spacing / 2; y += spacing) {
    for (let x = spacing / 2; x < VIEWBOX_WIDTH + spacing / 2; x += spacing) {
      const circle = createSvgElement("circle");
      circle.setAttribute("fill", "white");
      circle.setAttribute("opacity", "0");
      circle.setAttribute("r", "0");
      blobShapes.appendChild(circle);
      halftoneDots.push({
        element: circle,
        cx: x,
        cy: y,
        maxRadius: spacing * 0.42,
        phase: randomBetween(0, Math.PI * 2),
        noise: Math.random(),
        rank: 1,
      });
    }
  }

  reseedHalftoneRanks();
}

function setMaskMode(mode) {
  if (activeMaskMode === mode) {
    return;
  }

  activeMaskMode = mode;

  if (mode === "goo") {
    buildGooMask();
    return;
  }

  if (mode === "pixel") {
    buildPixelMask();
    return;
  }

  if (mode === "spotlight") {
    buildSpotlightMask();
    return;
  }

  if (mode === "halftone") {
    buildHalftoneMask();
    return;
  }

  clearMaskShapes();
  blobShapes.removeAttribute("filter");
}

function setBlobAttributes(blobElement, blob) {
  blobElement.setAttribute("cx", blob.x.toFixed(2));
  blobElement.setAttribute("cy", blob.y.toFixed(2));
  blobElement.setAttribute("rx", blob.rx.toFixed(2));
  blobElement.setAttribute("ry", blob.ry.toFixed(2));
  blobElement.setAttribute(
    "transform",
    `rotate(${blob.angle.toFixed(2)} ${blob.x.toFixed(2)} ${blob.y.toFixed(2)})`
  );
}

function updatePrimaryBlob(blob, index) {
  const lag = index * 3.2;
  const pulse = Math.sin(state.frame * blob.drift + lag);
  const sway = Math.cos(state.frame * (blob.drift * 0.82) + lag);
  const energy = 0.75 + state.blobEnergy * 0.4;
  const orbitX = state.blobActive ? sway * blob.orbit * state.blobScale * energy : 0;
  const orbitY = state.blobActive ? pulse * blob.orbit * 0.72 * state.blobScale * energy : 0;
  const follow = state.blobActive ? 0.22 - index * 0.022 : 0.11;

  blob.x += (pointer.x + orbitX - blob.x) * follow;
  blob.y += (pointer.y + orbitY - blob.y) * follow;

  const visibility = state.blobActive ? 1 : 0;
  const sizeEase = state.blobActive ? 0.18 : 0.1;
  const targetRx =
    (blob.baseRx * state.blobScale + pulse * blob.wobble * state.blobScale * energy) * visibility;
  const targetRy =
    (blob.baseRy * state.blobScale + sway * blob.wobble * state.blobScale * energy) * visibility;

  blob.rx += (targetRx - blob.rx) * sizeEase;
  blob.ry += (targetRy - blob.ry) * sizeEase;
  blob.angle += (pulse * 26 * energy - blob.angle) * 0.12;
}

function updateParticleBlob(blob) {
  if (state.blobActive) {
    blob.life -= blob.decay;
    if (blob.life <= 0) {
      resetParticle(blob);
    }

    const energy = 0.7 + state.blobEnergy * 0.45;
    const attractionX = (pointer.x - blob.x) * 0.0022 * energy;
    const attractionY = (pointer.y - blob.y) * 0.0022 * energy;
    const swirl = Math.sin(state.frame * 0.035 + blob.angle) * 0.018 * energy;

    blob.vx = (blob.vx + attractionX + swirl) * 0.988;
    blob.vy = (blob.vy + attractionY - swirl) * 0.988;
    blob.x += blob.vx;
    blob.y += blob.vy;

    const targetRadius = blob.baseRadius * Math.max(blob.life, 0);
    const pulse = Math.sin(state.frame * 0.07 + blob.phase);
    const targetRx = targetRadius * (0.9 + pulse * 0.08);
    const targetRy =
      targetRadius * (blob.stretch + Math.cos(state.frame * 0.06 + blob.phase) * 0.1);

    blob.rx += (targetRx - blob.rx) * 0.22;
    blob.ry += (targetRy - blob.ry) * 0.22;
    blob.angle += (blob.vx + blob.vy) * 18 + blob.spin;
  } else {
    blob.x += (pointer.x - blob.x) * 0.08;
    blob.y += (pointer.y - blob.y) * 0.08;
    blob.rx += (0 - blob.rx) * 0.14;
    blob.ry += (0 - blob.ry) * 0.14;
  }
}

function clearGlitchVisuals() {
  fullVariantImage.style.opacity = "0";
  fullVariantImage.style.transform = "";
  fullVariantImage.style.filter = "";
  fullVariantImage.style.clipPath = "";
  fullVariantImage.style.transformOrigin = "";

  glitchImages.forEach((image) => {
    image.style.opacity = "0";
    image.style.transform = "";
    image.style.filter = "";
    image.style.clipPath = "inset(0 0 100% 0)";
    image.style.transformOrigin = "";
  });
}

function showFullVariant(opacity = 1) {
  fullVariantImage.style.opacity = String(opacity);
}

function hideFullVariant() {
  fullVariantImage.style.opacity = "0";
  fullVariantImage.style.transform = "";
  fullVariantImage.style.filter = "";
  fullVariantImage.style.clipPath = "";
  fullVariantImage.style.transformOrigin = "";
}

function triggerGlitchBurst(now, intensity) {
  const isShader = intensity === "soft";
  const amount = isShader ? state.shaderAmount : state.glitchChaos;
  const frequency = isShader ? state.shaderFrequency : state.glitchRate;
  const offsetRange = isShader ? 12 * amount : 22 * amount;
  const blurRange = isShader ? 1.6 * amount : 0.8 * amount;

  syncVariantSource(pickRandomVariant());

  state.burstEndsAt =
    now + (isShader ? randomBetween(220, 380) : randomBetween(110, 190)) * (0.8 + amount * 0.35);
  state.nextBurstAt =
    now + (isShader ? randomBetween(900, 2200) : randomBetween(130, 360)) / Math.max(0.35, frequency);

  fullVariantImage.style.opacity = String(
    isShader ? randomBetween(0.12, 0.22) * (0.75 + amount * 0.35) : randomBetween(0.5, 0.92)
  );
  fullVariantImage.style.transform = `translate(${randomBetween(-offsetRange, offsetRange)}px, ${randomBetween(-offsetRange * 0.3, offsetRange * 0.3)}px)`;
  fullVariantImage.style.filter = isShader
    ? `contrast(${1.18 + amount * 0.2}) saturate(${1.22 + amount * 0.24}) blur(${randomBetween(0.2, blurRange)}px)`
    : `contrast(${1.3 + amount * 0.24}) saturate(${1.35 + amount * 0.35}) hue-rotate(${randomBetween(-26, 26) * amount}deg)`;

  glitchImages.forEach((image, index) => {
    const bandTop = clamp(randomBetween(index * 12, index * 22 + 12), 0, 92);
    const bandHeight = isShader
      ? randomBetween(7, 18) * (0.8 + amount * 0.35)
      : randomBetween(12, 28) * (0.8 + amount * 0.42);
    const bandBottom = clamp(100 - bandTop - bandHeight, 0, 100);
    const xShift = randomBetween(-offsetRange * 1.4, offsetRange * 1.4);
    const yShift = randomBetween(-offsetRange * 0.35, offsetRange * 0.35);

    image.style.opacity = String(
      isShader ? randomBetween(0.12, 0.34) * (0.7 + amount * 0.45) : randomBetween(0.42, 0.92)
    );
    image.style.clipPath = `inset(${bandTop}% 0 ${bandBottom}% 0)`;
    image.style.transform = `translate(${xShift}px, ${yShift}px)`;
    image.style.filter = [
      `hue-rotate(${randomBetween(-45, 45) * amount}deg)`,
      `contrast(${randomBetween(1.2, 1.75 + amount * 0.25)})`,
      `saturate(${randomBetween(1.15, 1.8 + amount * 0.35)})`,
      `blur(${randomBetween(0, blurRange)}px)`,
    ].join(" ");
  });
}

function updateModeClasses() {
  stage.classList.toggle("is-liquid-mode", state.mode === "liquid-wipe");
  stage.classList.toggle("is-pixel-mode", state.mode === "pixel-dissolve");
  stage.classList.toggle("is-heat-mode", state.mode === "heat-shimmer");
  stage.classList.toggle("is-spotlight-mode", state.mode === "spotlight-scan");
  stage.classList.toggle("is-halftone-mode", state.mode === "halftone-morph");
  stage.classList.toggle("is-magnet-mode", state.mode === "magnet-smear");
  stage.classList.toggle("is-glitch-mode", state.mode === "glitch-random");
  stage.classList.toggle("is-shader-mode", state.mode === "glitch-shader");
}

function updateControlVisibility() {
  modeControlGroups.forEach((group) => {
    group.classList.toggle("is-hidden", group.dataset.modeControls !== state.mode);
  });
}

function activateBlob() {
  setMaskMode("goo");
  state.blobActive = true;
  syncVariantSource(pickRandomVariant());
  gooBlobs.forEach((blob) => {
    if (blob.type === "particle") {
      resetParticle(blob);
    }
  });
  stage.classList.add("is-active");
}

function deactivateBlob() {
  state.blobActive = false;
  stage.classList.remove("is-active");
}

function startLiquidWipe() {
  setMaskMode("goo");
  syncVariantSource(pickRandomVariant());
  liquidOrigin.x = targetPointer.x;
  liquidOrigin.y = targetPointer.y;
  liquidFocus.x = targetPointer.x;
  liquidFocus.y = targetPointer.y;
  state.liquidProgress = 0.02;
  state.liquidTarget = 1;
  stage.classList.add("is-active");
}

function startPixelDissolve() {
  setMaskMode("pixel");
  syncVariantSource(pickRandomVariant());
  pixelOrigin.x = targetPointer.x;
  pixelOrigin.y = targetPointer.y;
  reseedPixelRanks();
  state.pixelProgress = 0.02;
  state.pixelTarget = 1;
  stage.classList.add("is-active");
}

function startHeatShimmer() {
  syncVariantSource(pickRandomVariant());
  showFullVariant(0.7);
}

function startSpotlightScan() {
  setMaskMode("spotlight");
  syncVariantSource(pickRandomVariant());
  state.spotlightPhase = targetPointer.x / VIEWBOX_WIDTH;
  state.spotlightProgress = 0.05;
  state.spotlightTarget = 1;
  stage.classList.add("is-active");
}

function startHalftoneMorph() {
  setMaskMode("halftone");
  syncVariantSource(pickRandomVariant());
  halftoneOrigin.x = targetPointer.x;
  halftoneOrigin.y = targetPointer.y;
  reseedHalftoneRanks();
  state.halftoneProgress = 0.02;
  state.halftoneTarget = 1;
  stage.classList.add("is-active");
}

function setMode(mode) {
  state.mode = mode;
  state.blobActive = false;
  state.nextTimedSwapAt = 0;
  state.nextBurstAt = 0;
  state.burstEndsAt = 0;
  state.timedFlashEndsAt = 0;
  state.liquidProgress = 0;
  state.liquidTarget = 0;
  state.pixelProgress = 0;
  state.pixelTarget = 0;
  state.spotlightProgress = 0;
  state.spotlightTarget = 0;
  state.halftoneProgress = 0;
  state.halftoneTarget = 0;
  stage.classList.remove("is-active");

  clearGlitchVisuals();
  applyFullVariantTransition();
  updateModeClasses();
  updateControlVisibility();

  if (mode === "blob" || mode === "liquid-wipe") {
    setMaskMode("goo");
  } else if (mode === "pixel-dissolve") {
    setMaskMode("pixel");
  } else if (mode === "spotlight-scan") {
    setMaskMode("spotlight");
  } else if (mode === "halftone-morph") {
    setMaskMode("halftone");
  } else {
    setMaskMode("");
  }

  if (mode === "timed-change") {
    syncVariantSource(pickRandomVariant());
    showFullVariant(1);
    state.nextTimedSwapAt = performance.now() + state.cycleInterval;
    return;
  }

  if (mode === "glitch-random") {
    state.nextBurstAt = performance.now() + randomBetween(120, 260) / Math.max(0.35, state.glitchRate);
    return;
  }

  if (mode === "glitch-shader") {
    state.nextBurstAt =
      performance.now() + randomBetween(700, 1600) / Math.max(0.35, state.shaderFrequency);
    return;
  }

  if (!state.hover) {
    return;
  }

  if (mode === "blob") {
    activateBlob();
    return;
  }

  if (mode === "liquid-wipe") {
    startLiquidWipe();
    return;
  }

  if (mode === "pixel-dissolve") {
    startPixelDissolve();
    return;
  }

  if (mode === "heat-shimmer") {
    startHeatShimmer();
    return;
  }

  if (mode === "spotlight-scan") {
    startSpotlightScan();
    return;
  }

  if (mode === "halftone-morph") {
    startHalftoneMorph();
    return;
  }

  if (mode === "magnet-smear") {
    syncVariantSource(pickRandomVariant());
    showFullVariant(1);
    return;
  }

  if (mode === "hover-change") {
    syncVariantSource(pickRandomVariant());
    showFullVariant(1);
  }
}

function updatePointer(event) {
  const rect = stage.getBoundingClientRect();
  targetPointer.x = clamp(
    ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH,
    0,
    VIEWBOX_WIDTH
  );
  targetPointer.y = clamp(
    ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT,
    0,
    VIEWBOX_HEIGHT
  );
}

function updatePointerMotion() {
  const follow =
    state.mode === "magnet-smear"
      ? 0.28
      : state.mode === "heat-shimmer"
        ? 0.18
        : state.mode === "blob"
          ? state.blobActive
            ? 0.24
            : 0.12
          : 0.16;

  pointer.x += (targetPointer.x - pointer.x) * follow;
  pointer.y += (targetPointer.y - pointer.y) * follow;
}

function handlePointerEnter(event) {
  state.hover = true;
  updatePointer(event);

  if (state.mode === "blob") {
    activateBlob();
    return;
  }

  if (state.mode === "liquid-wipe") {
    startLiquidWipe();
    return;
  }

  if (state.mode === "pixel-dissolve") {
    startPixelDissolve();
    return;
  }

  if (state.mode === "heat-shimmer") {
    startHeatShimmer();
    return;
  }

  if (state.mode === "spotlight-scan") {
    startSpotlightScan();
    return;
  }

  if (state.mode === "halftone-morph") {
    startHalftoneMorph();
    return;
  }

  if (state.mode === "magnet-smear") {
    syncVariantSource(pickRandomVariant());
    showFullVariant(1);
    return;
  }

  if (state.mode === "hover-change") {
    syncVariantSource(pickRandomVariant());
    showFullVariant(1);
  }
}

function handlePointerLeave() {
  state.hover = false;
  targetPointer.x = pointer.x;
  targetPointer.y = pointer.y;

  if (state.mode === "blob") {
    deactivateBlob();
    return;
  }

  if (state.mode === "liquid-wipe") {
    state.liquidTarget = 0;
    return;
  }

  if (state.mode === "pixel-dissolve") {
    state.pixelTarget = 0;
    return;
  }

  if (state.mode === "spotlight-scan") {
    state.spotlightTarget = 0;
    return;
  }

  if (state.mode === "halftone-morph") {
    state.halftoneTarget = 0;
    return;
  }

  if (state.mode === "heat-shimmer" || state.mode === "magnet-smear") {
    clearGlitchVisuals();
    return;
  }

  if (state.mode === "hover-change") {
    hideFullVariant();
  }
}

function updateBlobMask() {
  gooBlobs.forEach((blob, index) => {
    if (blob.type === "primary") {
      updatePrimaryBlob(blob, index);
    } else {
      updateParticleBlob(blob);
    }

    setBlobAttributes(blob.element, blob);
  });
}

function updateLiquidWipeMask() {
  const speed = state.liquidSpeed;
  const targetFocusX = state.hover
    ? liquidOrigin.x + (targetPointer.x - liquidOrigin.x) * (0.28 + speed * 0.08)
    : liquidOrigin.x;
  const targetFocusY = state.hover
    ? liquidOrigin.y + (targetPointer.y - liquidOrigin.y) * (0.28 + speed * 0.08)
    : liquidOrigin.y;

  liquidFocus.x += (targetFocusX - liquidFocus.x) * (0.12 + speed * 0.06);
  liquidFocus.y += (targetFocusY - liquidFocus.y) * (0.12 + speed * 0.06);
  state.liquidProgress += (state.liquidTarget - state.liquidProgress) * (0.08 + speed * 0.1);

  if (!state.hover && state.liquidProgress < 0.02) {
    stage.classList.remove("is-active");
  }

  const progress = Math.max(0, state.liquidProgress);
  const spread = state.liquidSpread;
  const turbulence = state.liquidTurbulence;
  const maxRadius = 58 + spread * 95;
  const coreRadius = progress * maxRadius;
  const activeLobes = Math.min(gooBlobs.length, 18);

  gooBlobs.forEach((blob, index) => {
    let targetX = liquidFocus.x;
    let targetY = liquidFocus.y;
    let targetRx = 0;
    let targetRy = 0;
    let targetAngle = 0;

    if (progress > 0.001 && index < activeLobes) {
      if (index === 0) {
        targetRx = coreRadius;
        targetRy = coreRadius * 0.92;
      } else {
        const ringIndex = index - 1;
        const ringPhase = ringIndex * 0.72;
        const ringBand = ringIndex < 6 ? 0.54 : ringIndex < 12 ? 0.84 : 1.06;
        const wave =
          Math.sin(state.frame * (0.024 + ringIndex * 0.0015) + ringPhase) * 0.14 * turbulence;
        const orbitRadius = coreRadius * ringBand * (0.84 + wave + turbulence * 0.04);
        const angle =
          ringPhase +
          state.frame * (0.008 + turbulence * 0.004) * (ringIndex % 2 === 0 ? 1 : -1);

        targetX = liquidFocus.x + Math.cos(angle) * orbitRadius;
        targetY = liquidFocus.y + Math.sin(angle) * orbitRadius * 0.82;

        const baseSize =
          ringIndex < 6 ? coreRadius * 0.24 : ringIndex < 12 ? coreRadius * 0.13 : coreRadius * 0.075;
        const pulse =
          0.86 + Math.cos(state.frame * 0.036 + ringPhase * 1.4) * 0.18 * turbulence;

        targetRx = Math.max(0, baseSize * pulse);
        targetRy = Math.max(0, baseSize * (0.82 + wave * 0.4 + turbulence * 0.06));
        targetAngle = Math.sin(state.frame * 0.03 + ringPhase) * 22 * turbulence;
      }
    }

    blob.x += (targetX - blob.x) * 0.18;
    blob.y += (targetY - blob.y) * 0.18;
    blob.rx += (targetRx - blob.rx) * 0.22;
    blob.ry += (targetRy - blob.ry) * 0.22;
    blob.angle += (targetAngle - blob.angle) * 0.16;

    setBlobAttributes(blob.element, blob);
  });
}

function updatePixelDissolveMask() {
  state.pixelProgress += (state.pixelTarget - state.pixelProgress) * (0.07 + state.pixelSpeed * 0.11);

  if (!state.hover && state.pixelProgress < 0.02) {
    stage.classList.remove("is-active");
  }

  const spread = 0.16 + state.pixelScatter * 0.08;

  pixelCells.forEach((cell) => {
    const reveal = clamp((state.pixelProgress - cell.rank + spread) / spread, 0, 1);
    const pulse = 0.92 + Math.sin(state.frame * 0.03 + cell.phase) * 0.06;
    const size = cell.size * reveal * pulse;
    const inset = (cell.size - size) / 2;
    const drift = (1 - reveal) * state.pixelScatter * 0.18;
    const offsetX = Math.sin(state.frame * 0.04 + cell.phase) * drift;
    const offsetY = Math.cos(state.frame * 0.05 + cell.phase) * drift;

    cell.element.setAttribute("x", (cell.x + inset + offsetX).toFixed(2));
    cell.element.setAttribute("y", (cell.y + inset + offsetY).toFixed(2));
    cell.element.setAttribute("width", Math.max(0.01, size).toFixed(2));
    cell.element.setAttribute("height", Math.max(0.01, size).toFixed(2));
    cell.element.setAttribute("opacity", reveal.toFixed(3));
  });
}

function updateSpotlightScanMask() {
  state.spotlightProgress +=
    (state.spotlightTarget - state.spotlightProgress) * (0.08 + state.spotlightSpeed * 0.08);

  if (!state.hover && state.spotlightProgress < 0.02) {
    stage.classList.remove("is-active");
  }

  const sweepWave = (Math.sin(state.frame * (0.02 + state.spotlightSpeed * 0.018)) + 1) / 2;
  const sweepX = 10 + sweepWave * 80;
  const beamX = sweepX * 0.78 + targetPointer.x * 0.22;
  const beamY = VIEWBOX_HEIGHT / 2 + Math.sin(state.frame * 0.02) * 1.5;
  const size = state.spotlightSize;
  const softness = state.spotlightSoftness;
  const baseRx = (9 + size * 14) * (0.35 + state.spotlightProgress * 0.65);
  const baseRy = (56 + size * 28) * (0.5 + state.spotlightProgress * 0.5);

  spotlightBeams.forEach((beam, index) => {
    const scale = 1 + index * 0.22 * (0.7 + softness * 0.6);
    const beamOpacity = beam.opacity * state.spotlightProgress;
    const offset = (index - 2) * softness * 1.6;

    beam.element.setAttribute("cx", (beamX + offset).toFixed(2));
    beam.element.setAttribute("cy", beamY.toFixed(2));
    beam.element.setAttribute("rx", (baseRx * scale).toFixed(2));
    beam.element.setAttribute("ry", (baseRy * (1 + index * 0.05)).toFixed(2));
    beam.element.setAttribute("opacity", beamOpacity.toFixed(3));
  });
}

function updateHalftoneMorphMask() {
  state.halftoneProgress +=
    (state.halftoneTarget - state.halftoneProgress) * (0.08 + state.halftoneSpeed * 0.09);

  if (!state.hover && state.halftoneProgress < 0.02) {
    stage.classList.remove("is-active");
  }

  const coverage = 0.42 + state.halftoneCoverage * 0.5;

  halftoneDots.forEach((dot) => {
    const local = clamp((state.halftoneProgress - dot.rank + 0.18) / 0.22, 0, 1);
    const pulse = 0.94 + Math.sin(state.frame * 0.05 + dot.phase) * 0.08 * local;
    const radius = dot.maxRadius * coverage * local * pulse;

    dot.element.setAttribute("cx", dot.cx.toFixed(2));
    dot.element.setAttribute("cy", dot.cy.toFixed(2));
    dot.element.setAttribute("r", radius.toFixed(2));
    dot.element.setAttribute("opacity", Math.min(1, local * 1.08).toFixed(3));
  });
}

function updateMaskAnimations() {
  if (state.mode === "blob") {
    updateBlobMask();
    return;
  }

  if (state.mode === "liquid-wipe") {
    updateLiquidWipeMask();
    return;
  }

  if (state.mode === "pixel-dissolve") {
    updatePixelDissolveMask();
    return;
  }

  if (state.mode === "spotlight-scan") {
    updateSpotlightScanMask();
    return;
  }

  if (state.mode === "halftone-morph") {
    updateHalftoneMorphMask();
  }
}

function updateHoverMode() {
  if (!state.hover) {
    hideFullVariant();
    return;
  }

  showFullVariant(1);
  fullVariantImage.style.transform = `scale(${1 + state.hoverZoom})`;
  fullVariantImage.style.filter = `contrast(${1.05 + state.hoverZoom * 0.8}) saturate(${1.04 + state.hoverZoom * 0.9})`;
}

function updateHeatShimmerMode() {
  if (!state.hover) {
    clearGlitchVisuals();
    return;
  }

  const intensity = state.heatIntensity;
  const radius = 16 + state.heatRadius * 20;
  const drift = state.heatDrift;
  const focusX = (pointer.x / VIEWBOX_WIDTH) * 100;
  const focusY = (pointer.y / VIEWBOX_HEIGHT) * 100;
  const phase = state.frame * (0.05 + drift * 0.03);
  const waveX = Math.sin(phase + pointer.y * 0.16) * (1.4 + intensity * 4.4);
  const waveY = Math.cos(phase * 0.82 + pointer.x * 0.11) * (0.9 + intensity * 2.4);

  showFullVariant(0.46 + intensity * 0.18);
  fullVariantImage.style.transformOrigin = `${focusX}% ${focusY}%`;
  fullVariantImage.style.clipPath = `ellipse(${radius}% ${radius * 1.15}% at ${focusX}% ${focusY}%)`;
  fullVariantImage.style.transform = `translate(${waveX.toFixed(2)}px, ${waveY.toFixed(2)}px) scale(${(1.01 + intensity * 0.04).toFixed(3)})`;
  fullVariantImage.style.filter =
    `blur(${(0.35 + intensity * 0.9).toFixed(2)}px) ` +
    `contrast(${(1.05 + intensity * 0.22).toFixed(2)}) ` +
    `saturate(${(1.08 + intensity * 0.18).toFixed(2)})`;

  glitchImages.forEach((image, index) => {
    const layer = index + 1;
    const layerRadius = radius + layer * (3 + state.heatRadius * 2.2);
    const layerWaveX =
      Math.sin(phase * (1 + layer * 0.15) + layer) * (1.8 + intensity * (2.6 + layer));
    const layerWaveY =
      Math.cos(phase * (0.9 + layer * 0.12) + layer * 0.5) * (0.8 + intensity * (1.5 + layer * 0.8));

    image.style.opacity = String(clamp(0.08 + intensity * (0.08 - index * 0.015), 0, 0.22));
    image.style.clipPath = `ellipse(${layerRadius}% ${layerRadius * 1.18}% at ${focusX}% ${focusY}%)`;
    image.style.transform = `translate(${layerWaveX.toFixed(2)}px, ${layerWaveY.toFixed(2)}px) scale(${(1.004 + layer * 0.008).toFixed(3)})`;
    image.style.filter =
      `blur(${(1.2 + layer * 0.8 + intensity * 0.9).toFixed(2)}px) ` +
      `saturate(${(1.04 + intensity * 0.16).toFixed(2)}) ` +
      `contrast(${(1.02 + layer * 0.05).toFixed(2)})`;
  });
}

function updateMagnetSmearMode() {
  if (!state.hover) {
    hideFullVariant();
    glitchImages.forEach((image) => {
      image.style.opacity = "0";
      image.style.transform = "";
      image.style.filter = "";
      image.style.clipPath = "inset(0 0 100% 0)";
    });
    return;
  }

  const centerX = VIEWBOX_WIDTH / 2;
  const centerY = VIEWBOX_HEIGHT / 2;
  const normalizedX = (pointer.x - centerX) / centerX;
  const normalizedY = (pointer.y - centerY) / centerY;
  const dragX = (targetPointer.x - pointer.x) / VIEWBOX_WIDTH;
  const dragY = (targetPointer.y - pointer.y) / VIEWBOX_HEIGHT;
  const pull = state.magnetStrength;
  const radius = 18 + state.magnetRadius * 22;
  const radiusY = radius * 0.9;
  const trail = state.magnetTrail;

  const smearX = normalizedX * 12 * pull + dragX * 120 * pull;
  const smearY = normalizedY * 7 * pull + dragY * 80 * pull;
  const stretchX = 1 + Math.abs(normalizedX) * 0.18 * pull + Math.abs(dragX) * 1.5 * pull;
  const stretchY = 1 + Math.abs(normalizedY) * 0.1 * pull + Math.abs(dragY) * 1.1 * pull;
  const rotation = normalizedX * 7 * pull + dragX * 80 * pull;
  const focusX = (pointer.x / VIEWBOX_WIDTH) * 100;
  const focusY = (pointer.y / VIEWBOX_HEIGHT) * 100;

  showFullVariant(0.94);
  fullVariantImage.style.transformOrigin = `${focusX}% ${focusY}%`;
  fullVariantImage.style.clipPath = `ellipse(${radius}% ${radiusY}% at ${focusX}% ${focusY}%)`;
  fullVariantImage.style.transform =
    `translate(${smearX.toFixed(2)}px, ${smearY.toFixed(2)}px) ` +
    `scale(${stretchX.toFixed(3)}, ${stretchY.toFixed(3)}) rotate(${rotation.toFixed(2)}deg)`;
  fullVariantImage.style.filter =
    `contrast(${1.04 + pull * 0.2}) saturate(${1.06 + pull * 0.28}) blur(${(0.1 + trail * 0.18).toFixed(2)}px)`;

  glitchImages.forEach((image, index) => {
    const layer = index + 1;
    const echo = trail * (0.3 + layer * 0.22);
    const echoX = -smearX * echo * (0.55 + layer * 0.1);
    const echoY = -smearY * echo * (0.4 + layer * 0.08);
    const layerRadius = Math.max(10, radius - layer * 4.5);
    const layerRadiusY = Math.max(10, radiusY - layer * 4);

    image.style.opacity = String(clamp(0.12 + trail * (0.18 - index * 0.04), 0, 0.26));
    image.style.clipPath = `ellipse(${layerRadius}% ${layerRadiusY}% at ${focusX}% ${focusY}%)`;
    image.style.transform =
      `translate(${echoX.toFixed(2)}px, ${echoY.toFixed(2)}px) ` +
      `scale(${(1 + stretchX * 0.02 + layer * 0.01).toFixed(3)}, ${(1 + stretchY * 0.02).toFixed(3)}) ` +
      `rotate(${(-rotation * (0.28 + layer * 0.08)).toFixed(2)}deg)`;
    image.style.filter =
      `blur(${(1.2 + layer * 1.1 * trail).toFixed(2)}px) ` +
      `saturate(${(1.08 + trail * 0.22).toFixed(2)}) ` +
      `contrast(${(1.02 + layer * 0.05).toFixed(2)})`;
  });
}

function updateTimedMode(now) {
  showFullVariant(1);

  if (now >= state.nextTimedSwapAt) {
    syncVariantSource(pickRandomVariant());
    state.nextTimedSwapAt = now + state.cycleInterval;
    state.timedFlashEndsAt = now + 160;
  }

  if (now < state.timedFlashEndsAt) {
    fullVariantImage.style.transform = `scale(${1 + state.timedJolt * 0.05})`;
    fullVariantImage.style.filter = `contrast(${1.03 + state.timedJolt * 0.18}) saturate(${1.03 + state.timedJolt * 0.15})`;
  } else {
    fullVariantImage.style.transform = "";
    fullVariantImage.style.filter = "";
  }
}

function updateGlitchModes(now) {
  const isRandomGlitch = state.mode === "glitch-random";
  const isShader = state.mode === "glitch-shader";

  if (!isRandomGlitch && !isShader) {
    return;
  }

  if (now >= state.nextBurstAt && now >= state.burstEndsAt) {
    triggerGlitchBurst(now, isShader ? "soft" : "hard");
  }

  if (now >= state.burstEndsAt && state.burstEndsAt !== 0) {
    clearGlitchVisuals();
    state.burstEndsAt = 0;
  }
}

function updateModeAnimations(now) {
  if (
    state.mode === "blob" ||
    state.mode === "liquid-wipe" ||
    state.mode === "pixel-dissolve" ||
    state.mode === "spotlight-scan" ||
    state.mode === "halftone-morph"
  ) {
    hideFullVariant();
    glitchImages.forEach((image) => {
      image.style.opacity = "0";
      image.style.transform = "";
      image.style.filter = "";
      image.style.clipPath = "inset(0 0 100% 0)";
    });
    return;
  }

  if (state.mode === "heat-shimmer") {
    updateHeatShimmerMode();
    return;
  }

  if (state.mode === "magnet-smear") {
    updateMagnetSmearMode();
    return;
  }

  if (state.mode === "hover-change") {
    updateHoverMode();
    return;
  }

  if (state.mode === "timed-change") {
    updateTimedMode(now);
    return;
  }

  if (state.mode === "glitch-random" || state.mode === "glitch-shader") {
    updateGlitchModes(now);
    return;
  }

  hideFullVariant();
}

function render(now = 0) {
  state.frame += 1;
  updatePointerMotion();
  updateMaskAnimations();
  updateModeAnimations(now);
  state.rafId = window.requestAnimationFrame(render);
}

modeSelect.addEventListener("change", (event) => {
  setMode(event.target.value);
});

blobSizeSlider.addEventListener("input", (event) => {
  state.blobScale = Number(event.target.value) / 100;
  updateBlobLabel();
});

blobWobbleSlider.addEventListener("input", (event) => {
  state.blobEnergy = Number(event.target.value) / 100;
  updateBlobEnergyLabel();
});

liquidSpreadSlider.addEventListener("input", (event) => {
  state.liquidSpread = Number(event.target.value) / 100;
  updateLiquidLabels();
});

liquidTurbulenceSlider.addEventListener("input", (event) => {
  state.liquidTurbulence = Number(event.target.value) / 100;
  updateLiquidLabels();
});

liquidSpeedSlider.addEventListener("input", (event) => {
  state.liquidSpeed = Number(event.target.value) / 100;
  updateLiquidLabels();
});

pixelSizeSlider.addEventListener("input", (event) => {
  state.pixelBlockSize = Number(event.target.value);
  updatePixelLabels();
  if (activeMaskMode === "pixel") {
    buildPixelMask();
  }
});

pixelScatterSlider.addEventListener("input", (event) => {
  state.pixelScatter = Number(event.target.value) / 100;
  updatePixelLabels();
  if (activeMaskMode === "pixel") {
    reseedPixelRanks();
  }
});

pixelSpeedSlider.addEventListener("input", (event) => {
  state.pixelSpeed = Number(event.target.value) / 100;
  updatePixelLabels();
});

heatIntensitySlider.addEventListener("input", (event) => {
  state.heatIntensity = Number(event.target.value) / 100;
  updateHeatLabels();
});

heatRadiusSlider.addEventListener("input", (event) => {
  state.heatRadius = Number(event.target.value) / 100;
  updateHeatLabels();
});

heatDriftSlider.addEventListener("input", (event) => {
  state.heatDrift = Number(event.target.value) / 100;
  updateHeatLabels();
});

spotlightSizeSlider.addEventListener("input", (event) => {
  state.spotlightSize = Number(event.target.value) / 100;
  updateSpotlightLabels();
});

spotlightSoftnessSlider.addEventListener("input", (event) => {
  state.spotlightSoftness = Number(event.target.value) / 100;
  updateSpotlightLabels();
});

spotlightSpeedSlider.addEventListener("input", (event) => {
  state.spotlightSpeed = Number(event.target.value) / 100;
  updateSpotlightLabels();
});

halftoneSizeSlider.addEventListener("input", (event) => {
  state.halftoneDotSize = Number(event.target.value);
  updateHalftoneLabels();
  if (activeMaskMode === "halftone") {
    buildHalftoneMask();
  }
});

halftoneCoverageSlider.addEventListener("input", (event) => {
  state.halftoneCoverage = Number(event.target.value) / 100;
  updateHalftoneLabels();
});

halftoneSpeedSlider.addEventListener("input", (event) => {
  state.halftoneSpeed = Number(event.target.value) / 100;
  updateHalftoneLabels();
});

magnetStrengthSlider.addEventListener("input", (event) => {
  state.magnetStrength = Number(event.target.value) / 100;
  updateMagnetLabels();
});

magnetRadiusSlider.addEventListener("input", (event) => {
  state.magnetRadius = Number(event.target.value) / 100;
  updateMagnetLabels();
});

magnetTrailSlider.addEventListener("input", (event) => {
  state.magnetTrail = Number(event.target.value) / 100;
  updateMagnetLabels();
});

glitchChaosSlider.addEventListener("input", (event) => {
  state.glitchChaos = Number(event.target.value) / 100;
  updateGlitchLabels();
});

glitchRateSlider.addEventListener("input", (event) => {
  state.glitchRate = Number(event.target.value) / 100;
  updateGlitchLabels();
  if (state.mode === "glitch-random") {
    state.nextBurstAt = performance.now() + randomBetween(120, 260) / Math.max(0.35, state.glitchRate);
  }
});

hoverTransitionSlider.addEventListener("input", (event) => {
  state.hoverTransition = Number(event.target.value);
  updateHoverLabels();
  applyFullVariantTransition();
});

hoverZoomSlider.addEventListener("input", (event) => {
  state.hoverZoom = Number(event.target.value) / 100;
  updateHoverLabels();
});

intervalSlider.addEventListener("input", (event) => {
  state.cycleInterval = Number(event.target.value);
  updateTimedLabels();
  if (state.mode === "timed-change") {
    state.nextTimedSwapAt = performance.now() + state.cycleInterval;
  }
});

timedJoltSlider.addEventListener("input", (event) => {
  state.timedJolt = Number(event.target.value) / 100;
  updateTimedLabels();
});

shaderFrequencySlider.addEventListener("input", (event) => {
  state.shaderFrequency = Number(event.target.value) / 100;
  updateShaderLabels();
  if (state.mode === "glitch-shader") {
    state.nextBurstAt =
      performance.now() + randomBetween(700, 1600) / Math.max(0.35, state.shaderFrequency);
  }
});

shaderAmountSlider.addEventListener("input", (event) => {
  state.shaderAmount = Number(event.target.value) / 100;
  updateShaderLabels();
});

stage.addEventListener("pointerenter", handlePointerEnter);
stage.addEventListener("pointermove", updatePointer);
stage.addEventListener("pointerleave", handlePointerLeave);

updateBlobLabel();
updateBlobEnergyLabel();
updateLiquidLabels();
updatePixelLabels();
updateHeatLabels();
updateSpotlightLabels();
updateHalftoneLabels();
updateMagnetLabels();
updateGlitchLabels();
updateHoverLabels();
updateTimedLabels();
updateShaderLabels();
applyFullVariantTransition();
syncVariantSource(state.currentVariant);
setMode(state.mode);
render();

window.addEventListener("beforeunload", () => {
  window.cancelAnimationFrame(state.rafId);
});
