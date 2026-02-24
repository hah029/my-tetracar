import * as THREE from "three";
import { scene } from "../core/scene.js";
import { LANES } from "./player.js";

export const obstacles = [];

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

const PATTERNS = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 1, 0, 0],
  [0, 0, 1, 1],
  [1, 0, 0, 1],
  [0, 1, 1, 0],
  [1, 1, 1, 0],
  [0, 1, 1, 1],
  [1, 0, 1, 1],
  [1, 1, 0, 1],
];

export function spawnObstacleRow(laneIndex, zPos = -60) {
  if (laneIndex < 0 || laneIndex >= LANES.length) return;

  const x = LANES[laneIndex];
  if (isNaN(x) || isNaN(zPos)) return; // защита от NaN

  // предотвращаем дублирование препятствия на одной позиции
  if (obstacles.some(o => o.position.z === zPos && o.userData.lane === laneIndex)) return;

  const obstacle = new THREE.Mesh(geometry, material);
  obstacle.position.set(x, 0.5, zPos);
  obstacle.userData.lane = laneIndex;

  scene.add(obstacle);
  obstacles.push(obstacle);
}