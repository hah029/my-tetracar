import * as THREE from "three";

const MULTIPLIER = 0.95;

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth * MULTIPLIER, window.innerHeight * MULTIPLIER);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth * MULTIPLIER, window.innerHeight * MULTIPLIER);
});