import * as THREE from "three";
import { scene } from "../core/scene.js";
import { cameraTarget } from "../core/cameraTarget.js";

// полосы
export const LANES = [-3, -1, 1, 3]; // теперь 4 полосы

export const car = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.5, 2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
car.position.set(0, 0.25, 3);
scene.add(car);

// камера-таргет
cameraTarget.position.set(0, 0, -10);
car.add(cameraTarget);

// коллайдер
export const carBox = new THREE.Box3();

// текущее положение в полосе
export let currentLane = 1; // изначально центр (вторая полоса)

export function moveLeft() {
  if (currentLane > 0) currentLane--;
  currentLane = Math.max(0, currentLane);
}

export function moveRight() {
  if (currentLane < LANES.length - 1) currentLane++;
  currentLane = Math.min(currentLane, LANES.length - 1);
}

// плавное движение к целевой полосе
export function updatePlayer(max_car_tilt) {
  const clampedLane = Math.min(Math.max(currentLane, 0), LANES.length - 1);
  const targetX = LANES[clampedLane];
  const deltaX = targetX - car.position.x;
  if (!isNaN(deltaX)) {
    car.position.x += deltaX * 0.2;
    car.rotation.y += (-deltaX * max_car_tilt - car.rotation.y) * 0.2; // плавный наклон
  }
}