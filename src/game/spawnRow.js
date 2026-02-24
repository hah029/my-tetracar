import { spawnObstacleRow } from "./obstacles.js";
import { createJump } from "./jumps.js";
import { LANES } from "./player.js";

const SPAWN_Z = -60;
const JUMP_DISTANCE_MIN = 4;
const JUMP_DISTANCE_MAX = 12;
const SPEED_FOR_MAX_JUMP = 3;
const JUMP_CHANCE = 0.2;

function getJumpDistance(speed) {
  const s = Number(speed) || 0.5;
  const factor = Math.min(s / SPEED_FOR_MAX_JUMP, 1);
  return JUMP_DISTANCE_MIN + (JUMP_DISTANCE_MAX - JUMP_DISTANCE_MIN) * factor;
}

export function spawnRow(speed) {
  const availableLanes = [...LANES.keys()]; // [0,1,2,3]

  // ---- Выбираем полосы для препятствий ----
  const lanesForObstacles = [];
  const obstacleCount = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < obstacleCount; i++) {
    if (availableLanes.length === 0) break;
    const idx = Math.floor(Math.random() * availableLanes.length);
    lanesForObstacles.push(availableLanes[idx]);
    availableLanes.splice(idx, 1);
  }

  // ---- Создаём препятствия с возможным трамплином ----
  lanesForObstacles.forEach(laneIndex => {
    // трамплин перед препятствием
    if (Math.random() < JUMP_CHANCE) {
      const jumpDistance = getJumpDistance(speed);
      const jumpZ = SPAWN_Z + jumpDistance;
      if (!isNaN(jumpZ)) createJump(jumpZ, laneIndex);
    }

    spawnObstacleRow(laneIndex, SPAWN_Z);
  });
}