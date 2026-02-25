// src/core/camera.js
import * as THREE from "three";

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// фиксированное смещение
camera.position.set(0, 3, 6);