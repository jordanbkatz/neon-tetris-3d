<template>
  <div style="position: relative; width: 100vw; height: 100vh; background: #030308; overflow: hidden;">
    <!-- Three.js Canvas Container -->
    <canvas ref="canvasRef" style="width: 100%; height: 100%; display: block;"></canvas>

    <!-- Cyber HUD Component -->
    <HudOverlay :score="score" :level="level" :lines="lines" />

    <!-- Footer -->
    <footer class="jk-footer">
      <a href="https://jordankatz.dev" target="_blank" rel="noopener">a Jordan Katz project</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import HudOverlay from './components/HudOverlay.vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const score = ref(0);
const level = ref(1);
const lines = ref(0);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let animationFrameId: number;

onMounted(() => {
  if (!canvasRef.value) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030308, 0.03);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x00f3ff, 1.2);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  const gridGeo = new THREE.BoxGeometry(10, 20, 10);
  const gridMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.2 });
  const prismMesh = new THREE.Mesh(gridGeo, gridMat);
  scene.add(prismMesh);

  const blockGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
  const blockMat = new THREE.MeshStandardMaterial({ color: 0xff007f, roughness: 0.2, metalness: 0.8 });
  const blockMesh = new THREE.Mesh(blockGeo, blockMat);
  blockMesh.position.set(0, 4, 0);
  scene.add(blockMesh);

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    blockMesh.rotation.x += 0.01;
    blockMesh.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});
</script>
