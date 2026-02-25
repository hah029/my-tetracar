// src/game/jumps.js
// jumps.js - обновлённая версия с использованием нового коллайдера
import * as THREE from "three";
import { scene } from "../core/scene.js";
import { car, checkJumpCollision } from "./player.js"; // импортируем новую функцию
import { baseSpeed } from "../state/gameState.js"

export const jumps = [];

const width = 2;
const height = 0.2;
const depth = 2;
const jumpGeometry = new THREE.BoxGeometry(width, height, depth);
jumpGeometry.rotateX(Math.PI / 12);

// Материалы с флуоресцентным свечением
const jumpMaterials = [
  new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: 0x442200,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.85
  }),
  new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0x442200,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.85
  }),
  new THREE.MeshStandardMaterial({
    color: 0xff4400,
    emissive: 0x441100,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.85
  })
];

// Функция для добавления светящихся полос
function addGlowStripes(jump, colorIndex) {
  const colors = [0xff8800, 0xffaa00, 0xff6600];
  const stripeMaterial = new THREE.MeshStandardMaterial({
    color: colors[colorIndex % colors.length],
    emissive: colors[colorIndex % colors.length],
    emissiveIntensity: 2.0
  });

  const stripePositions = [
    [-0.8, 0.15, 0.8], [0.8, 0.15, 0.8],
    [-0.8, 0.15, -0.8], [0.8, 0.15, -0.8],
    [0, 0.15, 0.9], [0, 0.15, -0.9]
  ];

  stripePositions.forEach(pos => {
    const stripeGeo = new THREE.BoxGeometry(0.2, 0.05, 0.3);
    const stripe = new THREE.Mesh(stripeGeo, stripeMaterial);
    stripe.position.set(pos[0], pos[1], pos[2]);
    jump.add(stripe);
  });

  const centerGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const center = new THREE.Mesh(centerGeo, stripeMaterial);
  center.position.set(0, 0.25, 0);
  jump.add(center);
}

export function createJump(zPosition, laneIndex = 1, laneOffset = [-3, -1, 1, 3]) {
  const materialIndex = Math.floor(Math.random() * jumpMaterials.length);
  const material = jumpMaterials[materialIndex].clone();

  const jump = new THREE.Mesh(jumpGeometry, material);
  jump.position.set(laneOffset[laneIndex], 0.25, zPosition);

  addGlowStripes(jump, materialIndex);

  jump.userData = {
    lane: laneIndex,
    materialIndex: materialIndex,
    pulseSpeed: 0.3 + Math.random() * 0.3,
    pulsePhase: Math.random() * Math.PI * 2
  };

  scene.add(jump);
  jumps.push(jump);
}

export function updateJumps(speed) {
  for (let i = jumps.length - 1; i >= 0; i--) {
    const jump = jumps[i];
    jump.position.z += speed;

    // Анимация свечения
    if (jump.material && jump.material.emissiveIntensity !== undefined) {
      const pulse = Math.sin(Date.now() * 0.005 + (jump.userData?.pulsePhase || 0)) * 0.3 + 0.7;
      jump.material.emissiveIntensity = 1.2 * pulse;
    }

    // Используем новую функцию checkJumpCollision из player.js
    if (checkJumpCollision(jump) && !car.userData.isJumping) {
      car.userData.isJumping = true;

      const speedRatio = speed / baseSpeed;
      const jumpMultiplier = 0.2 * Math.sqrt(speedRatio) + 0.8;
      car.userData.jumpVelocity = 0.2 * jumpMultiplier;
      car.userData.jumpStartSpeed = speed;

      // Визуальный эффект при активации
      if (jump.material) {
        jump.material.emissiveIntensity = 3.0;
        setTimeout(() => {
          if (jump.material) {
            jump.material.emissiveIntensity = 1.2;
          }
        }, 200);
      }
    }

    if (jump.position.z > 10) {
      scene.remove(jump);
      jumps.splice(i, 1);
    }
  }
}

export function applyJump() {
  if (!car.userData.isJumping) {
    car.userData.targetPitch = 0;
    return;
  }

  const BASE_GRAVITY = 0.02;
  const speedRatio = car.userData.jumpStartSpeed / baseSpeed;
  const exponent = 0.6;
  const gravity = BASE_GRAVITY / Math.pow(speedRatio, exponent);

  car.position.y += car.userData.jumpVelocity;
  car.userData.jumpVelocity -= gravity;

  const maxPitch = 0.5;
  const baseJumpVelocity = 0.2;

  let targetPitch = (car.userData.jumpVelocity / baseJumpVelocity) * maxPitch;
  targetPitch = Math.max(-maxPitch, Math.min(maxPitch, targetPitch));
  car.userData.targetPitch = targetPitch;

  if (car.position.y <= 0.25) {
    car.position.y = 0.25;
    car.userData.isJumping = false;
    car.userData.jumpVelocity = 0;
    car.userData.targetPitch = 0;
  }
}

export function resetJumps() {
  jumps.forEach(jump => {
    scene.remove(jump);
  });
  jumps.length = 0;
}