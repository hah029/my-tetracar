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

// ======================
// ДОРОГА
// ======================
const roadGeometry = new THREE.PlaneGeometry(12, 250);
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.z = -80;
scene.add(road);