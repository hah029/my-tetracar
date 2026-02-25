// src/loop/animate.js
import * as THREE from "three";
import { scene } from "../core/scene.js";
import { camera } from "../core/camera.js";
import { renderer } from "../core/renderer.js";
import {
  car,
  checkObstacleCollision,
  updatePlayer,
  createDebugCollider,
  destroyCar,
  updateDestroyedCubes,
} from "../game/player.js";
import { updateRoadLines } from "../game/road.js";
import { obstacles } from "../game/obstacles.js";
import { currentState, GameState, gameData, setState, baseSpeed } from "../state/gameState.js";
import { showGameOverMenu } from "../ui/gameOverMenu.js";
import { addScore } from "../score/score.js";
import { updateHUD, pulseNitro } from "../ui/hud.js";
import { updateJumps, applyJump } from "../game/jumps.js";
import { updateSideObjects } from "../game/roadObjects.js";
import { updateObstacles } from "../game/obstacles.js";
import { currentLane } from "../game/player.js";

let debugCollider = null;
let collisionCooldown = false; // Предотвращаем множественные столкновения
let gameOverTimer = null;

// ---- Камера ----
const CAMERA_FOLLOW_SPEED = 0.08;
const CAMERA_Y_OFFSET = 4;
const CAMERA_SPEED_Z_MIN = 5;
const CAMERA_SPEED_Z_MAX = 3;
const SPEED_FOR_MAX_Z = 2;
const FOV_MIN = 55;
const FOV_MAX = 120;
const SPEED_FOR_MAX_FOV = 3;
const DANGER_DISTANCE = 30;

// ---- Машина ----
const MAX_CAR_TILT = 0.3;
const CAR_TILT_SPEED = 0.1;

function checkCollisions() {
  if (car.userData.isDestroyed || collisionCooldown) return false;

  for (const obstacle of obstacles) {
    if (checkObstacleCollision(obstacle)) {
      // Запоминаем точку столкновения
      const impactPoint = obstacle.position.clone();
      return { collision: true, impactPoint };
    }
  }
  return { collision: false };
}

export function getDangerLevel(speed) {
  if (car.userData.isDestroyed) return 0;

  const carPos = car.position.clone();
  let maxDanger = 0;

  for (const obstacle of obstacles) {
    const obstaclePos = obstacle.position.clone();

    if (obstaclePos.z >= carPos.z) continue;

    const zDiff = Math.abs(obstaclePos.z - carPos.z);
    const xDiff = Math.abs(obstaclePos.x - carPos.x);

    if (zDiff > DANGER_DISTANCE * 2 || xDiff > 1.0) continue;

    const dangerByZ = Math.max(0, 1 - (zDiff / DANGER_DISTANCE));
    const dangerByX = Math.max(0, 1 - (xDiff / 1.0));
    const danger = (dangerByZ * 0.7 + dangerByX * 0.3);

    maxDanger = Math.max(maxDanger, danger);
  }

  return maxDanger;
}

export function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);

  // Инициализация дебаг коллайдера
  if (!debugCollider) {
    debugCollider = createDebugCollider();
  }

  // Если не в игре, просто рендерим
  if (currentState !== GameState.PLAYING) {
    return;
  }

  // Обновляем скорость
  let currentSpeed = gameData.baseSpeed;
  if (gameData.is_nitro_enabled && !car.userData.isDestroyed) {
    currentSpeed *= gameData.nitroMultiplier;
    pulseNitro();
  }

  if (!car.userData.isDestroyed) {
    gameData.baseSpeed += gameData.baseSpeed < gameData.maxSpeed ? 0.0005 : 0.0;
  }
  gameData.speed = currentSpeed;

  // Обновляем счёт и HUD
  if (!car.userData.isDestroyed) {
    addScore(currentSpeed * 1.0);
  }
  const dangerLevel = getDangerLevel();
  updateHUD(currentSpeed, currentLane, dangerLevel > 0.5);

  // Если машина разрушена, обновляем анимацию разлёта
  if (car.userData.isDestroyed) {
    updateDestroyedCubes();
    updateCameraForDestroyedState();
  } else {
    // Нормальное обновление игры
    updateCar(car);
    updateObstacles(currentSpeed);

    if (typeof updateJumps === "function") updateJumps(currentSpeed);
    if (typeof applyJump === "function") applyJump();

    // Проверка столкновений
    const collisionResult = checkCollisions();
    if (collisionResult.collision && !collisionCooldown) {
      collisionCooldown = true;

      // Разрушаем машину
      destroyCar(collisionResult.impactPoint);

      // Запускаем таймер для показа меню Game Over
      if (gameOverTimer) clearTimeout(gameOverTimer);
      gameOverTimer = setTimeout(() => {
        setState(GameState.GAME_OVER);
        showGameOverMenu();
        gameData.speed = baseSpeed;
        gameData.baseSpeed = baseSpeed;
        collisionCooldown = false;
      }, 1500); // Показываем меню через 1.5 секунды после разрушения

      return; // Выходим, чтобы не обновлять камеру дальше
    }
  }

  // Обновляем дебаг коллайдер
  if (debugCollider) {
    debugCollider.updateDebug();
  }

  // Обновляем камеру
  if (!car.userData.isDestroyed) {
    updateCamera(camera, currentSpeed);
  }

  // Обновляем дорожные объекты
  updateRoadLines(currentSpeed);
  updateSideObjects(currentSpeed);
}

function updateCar(car) {
  if (car.userData.isDestroyed) return;

  const targetX = car.userData.targetX ?? car.position.x;
  const deltaX = targetX - car.position.x;
  updatePlayer(MAX_CAR_TILT);
  car.rotation.y += (-deltaX * MAX_CAR_TILT - car.rotation.y) * CAR_TILT_SPEED;
}

function updateCamera(camera, currentSpeed) {
  if (car.userData.isDestroyed) return;

  const desiredX = car.position.x;
  const desiredY = CAMERA_Y_OFFSET;

  const speedFactorZ = Math.min(currentSpeed / SPEED_FOR_MAX_Z, 1);
  const dynamicZ = CAMERA_SPEED_Z_MIN + (CAMERA_SPEED_Z_MAX - CAMERA_SPEED_Z_MIN) * speedFactorZ;
  const desiredZ = car.position.z + dynamicZ;

  camera.position.x += (desiredX - camera.position.x) * CAMERA_FOLLOW_SPEED;
  camera.position.y += (desiredY - camera.position.y) * CAMERA_FOLLOW_SPEED;
  camera.position.z += (desiredZ - camera.position.z) * CAMERA_FOLLOW_SPEED;

  const targetTilt = -car.rotation.y * 0.5;
  camera.rotation.z += (targetTilt - camera.rotation.z) * CAMERA_FOLLOW_SPEED;

  const speedFactorFOV = Math.min(currentSpeed / SPEED_FOR_MAX_FOV, 1);
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
}

function updateCameraForDestroyedState() {
  // Камера следует за центром масс разлетающихся кубиков
  if (car.userData.cubes && car.userData.cubes.length > 0) {
    const center = new THREE.Vector3();
    car.userData.cubes.forEach(cube => {
      center.add(cube.position);
    });
    center.divideScalar(car.userData.cubes.length);

    // Плавно двигаем камеру к центру разлёта
    camera.position.lerp(center.clone().add(new THREE.Vector3(0, 2, 5)), 0.05);
    camera.lookAt(center);
  }
}

// Функция для сброса состояния при рестарте
export function resetGame() {
  if (gameOverTimer) {
    clearTimeout(gameOverTimer);
    gameOverTimer = null;
  }
  collisionCooldown = false;
}