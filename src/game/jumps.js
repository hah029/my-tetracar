import * as THREE from "three";
import { scene } from "../core/scene.js";
import { car } from "./player.js";

export const jumps = [];

// const jumpGeometry = new THREE.BoxGeometry(2, 0.5, 2);
// const jumpGeometry = new THREE.BufferGeometry();
const width = 2;
const height = 0.2;
const depth = 2;
const jumpGeometry = new THREE.BoxGeometry(width, height, depth);
jumpGeometry.rotateX(Math.PI/12); // лёгкий наклон
const jumpMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00 });

export function createJump(zPosition, laneIndex = 1, laneOffset = [-3, -1, 1, 3]) {
  const jump = new THREE.Mesh(jumpGeometry, jumpMaterial);
  jump.position.set(laneOffset[laneIndex], 0.25, zPosition);
  jump.userData.lane = laneIndex;
  scene.add(jump);
  jumps.push(jump);
}

// обновление движения трамплинов и проверка столкновения с машиной
export function updateJumps(speed) {
  for (let i = jumps.length - 1; i >= 0; i--) {
    const jump = jumps[i];
    jump.position.z += speed;

    // если машина на трамплине
    if (Math.abs(car.position.z - jump.position.z) < 1 &&
        Math.abs(car.position.x - jump.position.x) < 1) {
      car.userData.isJumping = true;
      car.userData.jumpVelocity = 0.2; // стартовая скорость вверх
    }

    // удаляем трамплины после прохождения
    if (jump.position.z > 10) {
      scene.remove(jump);
      jumps.splice(i, 1);
    }
  }
}

// обработка прыжка машины
export function applyJump() {
  if (!car.userData.isJumping) return;

  car.position.y += car.userData.jumpVelocity;
  car.userData.jumpVelocity -= 0.01; // гравитация

  if (car.position.y <= 0.25) {
    car.position.y = 0.25;
    car.userData.isJumping = false;
    car.userData.jumpVelocity = 0;
  }
}