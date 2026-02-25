// src/game/obstacles.js
import * as THREE from "three";
import { scene } from "../core/scene.js";
import { LANES } from "./lanes.js";

export const obstacles = [];

// Создаём несколько вариантов материалов для разнообразия
const materials = [
  new THREE.MeshStandardMaterial({
    color: 0xff3366,
    emissive: 0x440011,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.9
  }),
  new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0x442200,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.9
  }),
  new THREE.MeshStandardMaterial({
    color: 0x44ff88,
    emissive: 0x004422,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.9
  }),
  new THREE.MeshStandardMaterial({
    color: 0xaa44ff,
    emissive: 0x220044,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.9
  })
];

// Используем только одну геометрию для простоты
const geometry = new THREE.BoxGeometry(1.8, 0.5, 1.2);

export function spawnObstacleRow(laneIndex, zPos = -60, variant = null) {
  if (laneIndex < 0 || laneIndex >= LANES.length) return;

  const x = LANES[laneIndex];
  if (isNaN(x) || isNaN(zPos)) return;

  // предотвращаем дублирование препятствия на одной позиции
  if (obstacles.some(o => o.position.z === zPos && o.userData.lane === laneIndex)) return;

  // Выбираем случайный материал
  const materialIndex = variant !== null ? variant % materials.length : Math.floor(Math.random() * materials.length);

  const obstacle = new THREE.Mesh(geometry, materials[materialIndex].clone());

  // ВАЖНО: опускаем препятствие на землю
  // Высота препятствия 0.5, поэтому центр должен быть на 0.25 (половина высоты)
  // чтобы нижняя грань была на уровне земли (y=0)
  obstacle.position.set(x, 0.25, zPos);

  // Случайное вращение для разнообразия
  obstacle.rotation.y = Math.random() * Math.PI;

  obstacle.userData = {
    lane: laneIndex,
    variant: materialIndex,
    baseColor: materials[materialIndex].color,
    pulseSpeed: 0.5 + Math.random() * 0.5,
    pulsePhase: Math.random() * Math.PI * 2
  };

  scene.add(obstacle);
  obstacles.push(obstacle);
}

export function updateObstacles(speed) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    obstacle.position.z += speed;

    // Анимация свечения
    if (obstacle.isMesh && obstacle.material.emissive) {
      const pulse = Math.sin(Date.now() * 0.005 + (obstacle.userData?.pulsePhase || 0)) * 0.5 + 0.5;
      obstacle.material.emissiveIntensity = 1.0 + pulse * 1.0;
      obstacle.rotation.y += 0.02;
    }

    if (obstacle.position.z > 10) {
      scene.remove(obstacle);
      obstacles.splice(i, 1);
    }
  }
}

export function resetObstacles() {
  obstacles.forEach(obs => {
    scene.remove(obs);
  });
  obstacles.length = 0;
}

// Функция для спавна нескольких препятствий в ряд
export function spawnObstaclePattern(zPos = -60, pattern = 'random') {
  switch (pattern) {
    case 'wall':
      // Стена из препятствий на всех полосах
      for (let i = 0; i < LANES.length; i++) {
        spawnObstacleRow(i, zPos, i);
      }
      break;

    case 'zigzag':
      // Зигзаг
      for (let i = 0; i < LANES.length; i++) {
        spawnObstacleRow(i, zPos - i * 3, i);
      }
      break;

    case 'random':
    default:
      // Случайные препятствия
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const lane = Math.floor(Math.random() * LANES.length);
        spawnObstacleRow(lane, zPos - i * 4);
      }
      break;
  }
}