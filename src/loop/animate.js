import * as THREE from "three";
import { scene } from "../core/scene.js";
import { camera } from "../core/camera.js";
import { renderer } from "../core/renderer.js";
import { car, carBox, updatePlayer } from "../game/player.js";
import { roadLines } from "../game/road.js";
import { obstacles } from "../game/obstacles.js";
import { currentState, GameState, gameData, setState } from "../state/gameState.js";
import { showGameOver } from "../ui/screens.js";
import { addScore } from "../score/score.js";
import { updateHUD } from "../ui/hud.js";
import { updateJumps, applyJump } from "../game/jumps.js";
import { updateSideObjects } from "../game/roadObjects.js";

// ---- Камера ----
const CAMERA_FOLLOW_SPEED = 0.08;
const CAMERA_Y_OFFSET = 4;
const CAMERA_SPEED_Z_MIN = 5;
const CAMERA_SPEED_Z_MAX = 3;
const SPEED_FOR_MAX_Z = 2;
const FOV_MIN = 55;
const FOV_MAX = 120;
const SPEED_FOR_MAX_FOV = 3;

// ---- Машина ----
const MAX_CAR_TILT = 0.1;
const CAR_TILT_SPEED = 0.2;

function checkCollisions() {
  carBox.setFromObject(car);
  for (const obstacle of obstacles) {
    const box = new THREE.Box3().setFromObject(obstacle);
    if (carBox.intersectsBox(box)) return true;
  }
  return false;
}

export function animate() {
  requestAnimationFrame(animate);

  if (currentState !== GameState.PLAYING) {
    renderer.render(scene, camera);
    return;
  }

  const speed = Number(gameData.speed) || 0.5;

  addScore(speed * 2);
  updateHUD(speed);

  // ---- Движение игрока + наклон машины ----
  const targetX = car.userData.targetX ?? car.position.x;
  const deltaX = targetX - car.position.x;
  updatePlayer(MAX_CAR_TILT);
  car.rotation.y += (-deltaX * MAX_CAR_TILT - car.rotation.y) * CAR_TILT_SPEED;

  // ---- Движение препятствий ----
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].position.z += speed;
    if (obstacles[i].position.z > 10) {
      scene.remove(obstacles[i]);
      obstacles.splice(i, 1);
    }
  }

  // ---- Прыжки ----
  if (typeof updateJumps === "function") updateJumps(speed);
  if (typeof applyJump === "function") applyJump();

  if (checkCollisions()) {
    setState(GameState.GAME_OVER);
    showGameOver();
    gameData.speed = 0.5;
    return;
  }

  // ---- Камера ----
  const desiredX = car.position.x;
  const desiredY = CAMERA_Y_OFFSET;

  const speedFactorZ = Math.min(speed / SPEED_FOR_MAX_Z, 1);
  const dynamicZ = CAMERA_SPEED_Z_MIN + (CAMERA_SPEED_Z_MAX - CAMERA_SPEED_Z_MIN) * speedFactorZ;
  const desiredZ = car.position.z + dynamicZ;

  camera.position.x += (desiredX - camera.position.x) * CAMERA_FOLLOW_SPEED;
  camera.position.y += (desiredY - camera.position.y) * CAMERA_FOLLOW_SPEED;
  camera.position.z += (desiredZ - camera.position.z) * CAMERA_FOLLOW_SPEED;

  const targetTilt = -car.rotation.y * 0.5;
  camera.rotation.z += (targetTilt - camera.rotation.z) * CAMERA_FOLLOW_SPEED;

  const speedFactorFOV = Math.min(speed / SPEED_FOR_MAX_FOV, 1);
  const targetFOV = FOV_MIN + (FOV_MAX - FOV_MIN) * speedFactorFOV;
  camera.fov = THREE.MathUtils.clamp(camera.fov + (targetFOV - camera.fov) * CAMERA_FOLLOW_SPEED, 10, 170);
  camera.updateProjectionMatrix();

  const lookAtPos = car.position.clone();
  lookAtPos.z -= 10;
  camera.lookAt(lookAtPos);

  if (!isNaN(car.position.x) && !isNaN(car.position.z)) {
    camera.position.x += (car.position.x - camera.position.x) * CAMERA_FOLLOW_SPEED;
    camera.position.z += ((car.position.z + dynamicZ) - camera.position.z) * CAMERA_FOLLOW_SPEED;
  }

  renderer.render(scene, camera);

  gameData.speed += 0.0005;

  roadLines.forEach(line => {
    line.position.z += speed;
    const segmentLength = 1.5;
    const gap = 1.5;
    const totalSegments = Math.ceil(200 / (segmentLength + gap)) + 10;
    if (line.position.z > 10) {
      line.position.z -= totalSegments * (segmentLength + gap);
    }
  });
  updateSideObjects(speed);
}