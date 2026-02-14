import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { TIFFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/TIFFLoader.js";

const DAYMAP_URL = "./assets/earth/2k_earth_daymap.jpg";
const NORMAL_MAP_URL = "./assets/earth/2k_earth_normal_map.tif";
const SPECULAR_MAP_URL = "./assets/earth/2k_earth_specular_map.tif";
const CLOUDS_MAP_URL = "./assets/earth/2k_earth_clouds.jpg";
const OVERLAY_TEXTURE_URLS = {
  none: "",
  seabed2030: "./assets/textures/overlay-seabed2030.png",
  globalforestwatch: "./assets/textures/overlay-globalforestwatch.png",
  climateTemperature: "./assets/textures/overlay-climate-temperature.png"
};

function makeLatLonTexture({
  width = 1024,
  height = 512,
  background = "#0f2840",
  lineColor = "rgba(255,255,255,0.18)",
  accentColor = "rgba(90,190,255,0.28)",
  accentOpacity = 0.9
} = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  for (let y = 0; y <= height; y += height / 12) {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  for (let x = 0; x <= width; x += width / 24) {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.globalAlpha = accentOpacity;
  ctx.fillStyle = accentColor;
  for (let i = 0; i < 9; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const rx = 40 + Math.random() * 130;
    const ry = 20 + Math.random() * 70;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function makeOverlayTexture(kind) {
  if (kind === "none") return null;

  if (kind === "seabed2030") {
    return makeLatLonTexture({
      background: "rgba(0,0,0,0)",
      lineColor: "rgba(0,255,255,0.14)",
      accentColor: "rgba(0,235,255,0.34)",
      accentOpacity: 0.8
    });
  }
  if (kind === "globalforestwatch") {
    return makeLatLonTexture({
      background: "rgba(0,0,0,0)",
      lineColor: "rgba(124,255,95,0.12)",
      accentColor: "rgba(78,235,102,0.34)",
      accentOpacity: 0.78
    });
  }
  return makeLatLonTexture({
    background: "rgba(0,0,0,0)",
    lineColor: "rgba(255,160,95,0.10)",
    accentColor: "rgba(255,80,42,0.36)",
    accentOpacity: 0.75
  });
}

function loadTextureOrFallback(loader, url, fallbackTexture) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(fallbackTexture);
      return;
    }

    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      () => resolve(fallbackTexture)
    );
  });
}

function loadTextureWithLoader(loader, url, onLoad) {
  loader.load(
    url,
    (texture) => onLoad(texture),
    undefined,
    (error) => console.warn(`Failed to load texture: ${url}`, error)
  );
}

export function createThreeScene({ canvasId, stageId, onControlsChange }) {
  const canvas = document.getElementById(canvasId);
  const stage = document.getElementById(stageId);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const textureLoader = new THREE.TextureLoader();
  const tiffLoader = new TIFFLoader();

  // Load environment
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('./assets/temp/environment/hintze_hall_nhm_london_surface_model.glb', (gltf) => {
    const environment = gltf.scene;
    environment.scale.set(5, 5, 5);
    environment.position.y = -16;
    environment.position.x = 36;
    environment.position.z = -2;
    scene.add(environment);
  });

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
  camera.position.set(0, 0, 15);

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(8, 12, 6);
  scene.add(key);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.target.set(0, 0, 0);
  controls.minDistance = 12;
  controls.maxDistance = 18;
  controls.minPolarAngle = Math.PI / 3.3;      
  controls.maxPolarAngle = 2.2 * Math.PI / 3.3; 

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const globeRadius = 5.0;
  const cloudRadius = 5.08;
  const overlayRadius = 5.16;
  const globeSegments = 96;
  const sphereGeometry = new THREE.SphereGeometry(globeRadius, globeSegments, globeSegments);
  const cloudGeometry = new THREE.SphereGeometry(cloudRadius, globeSegments, globeSegments);
  const overlayGeometry = new THREE.SphereGeometry(overlayRadius, globeSegments, globeSegments);

  const baseTextureFallback = makeLatLonTexture({
    background: "#183653",
    lineColor: "rgba(255,255,255,0.16)",
    accentColor: "rgba(84,190,255,0.34)",
    accentOpacity: 0.85
  });

  const baseMaterial = new THREE.MeshPhongMaterial({
    map: baseTextureFallback,
    normalScale: new THREE.Vector2(0.7, -0.7),
    specular: new THREE.Color(0x555555),
    shininess: 16
  });

  const cloudsMaterial = new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const overlayMaterial = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    roughness: 0.9,
    metalness: 0.0,
    map: null
  });

  const globeMesh = new THREE.Mesh(sphereGeometry, baseMaterial);
  const cloudsMesh = new THREE.Mesh(cloudGeometry, cloudsMaterial);
  const overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial);
  cloudsMesh.visible = false;
  overlayMesh.visible = false;
  globeGroup.add(globeMesh);
  globeGroup.add(cloudsMesh);
  globeGroup.add(overlayMesh);

  const overlayTextureCache = { none: null };

  async function setOverlay(kind) {
    const key = kind in OVERLAY_TEXTURE_URLS ? kind : "none";
    if (key === "none") {
      overlayMesh.visible = false;
      overlayMaterial.map = null;
      overlayMaterial.needsUpdate = true;
      return;
    }

    if (!overlayTextureCache[key]) {
      const fallback = makeOverlayTexture(key);
      overlayTextureCache[key] = await loadTextureOrFallback(
        textureLoader,
        OVERLAY_TEXTURE_URLS[key],
        fallback
      );
    }

    overlayMaterial.map = overlayTextureCache[key];
    overlayMaterial.needsUpdate = true;
    overlayMesh.visible = true;
  }

  loadTextureWithLoader(textureLoader, DAYMAP_URL, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    baseMaterial.map = texture;
    baseMaterial.needsUpdate = true;
  });

  loadTextureWithLoader(tiffLoader, NORMAL_MAP_URL, (texture) => {
    texture.colorSpace = THREE.NoColorSpace;
    texture.flipY = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    //baseMaterial.normalMap = texture;
    baseMaterial.needsUpdate = true;
  });

  loadTextureWithLoader(tiffLoader, SPECULAR_MAP_URL, (texture) => {
    texture.colorSpace = THREE.NoColorSpace;
    texture.flipY = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    //baseMaterial.specularMap = texture;
    baseMaterial.needsUpdate = true;
  });

  loadTextureWithLoader(textureLoader, CLOUDS_MAP_URL, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    cloudsMaterial.map = texture;
    cloudsMaterial.needsUpdate = true;
    cloudsMesh.visible = true;
    baseMaterial.needsUpdate = true;
  });

  if (typeof onControlsChange === "function") {
    controls.addEventListener("change", onControlsChange);
  }

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function renderFrame() {
    controls.update();
    globeGroup.rotation.y += 0.0012;
    cloudsMesh.rotation.y += 0.00145;
    overlayMesh.rotation.y = globeMesh.rotation.y;
    renderer.render(scene, camera);
  }

  return { THREE, renderer, scene, camera, controls, resize, renderFrame, setOverlay };
}
