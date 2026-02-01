import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

export function createThreeScene({ canvasId, stageId, onControlsChange }) {
  const canvas = document.getElementById(canvasId);
  const stage = document.getElementById(stageId);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
  camera.position.set(6, 4, 10);

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(8, 12, 6);
  scene.add(key);

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f141b, roughness: 0.9, metalness: 0.05 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0b1016, roughness: 0.95, metalness: 0.03 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), wallMat);
  backWall.position.set(0, 10, -18);
  scene.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-22, 10, 0);
  scene.add(leftWall);

  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x1a2330, roughness: 0.5, metalness: 0.25 });
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.7, 1.2, 48), pedestalMat);
  pedestal.position.set(0, -0.6, 0);
  scene.add(pedestal);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.08, 16, 90),
    new THREE.MeshStandardMaterial({
      color: 0x67d7ff,
      emissive: 0x1a6a7a,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.1
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.05, 0);
  scene.add(ring);

  const controls = new OrbitControls(camera, stage);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0.6, 0);
  controls.minDistance = 4;
  controls.maxDistance = 35;

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
