// src/core/scene.js
import * as THREE from "three";

export const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 70);


// ======================
// СВЕТ
// ======================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);
