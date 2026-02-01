import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

export function createThreeScene({ canvasId, stageId, onControlsChange }) {
  const canvas = document.getElementById(canvasId);
  const stage = document.getElementById(stageId);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();

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
    renderer.render(scene, camera);
  }

  return { THREE, renderer, scene, camera, controls, resize, renderFrame };
}
