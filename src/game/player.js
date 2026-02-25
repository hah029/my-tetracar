import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { scene } from "../core/scene.js";
import { cameraTarget } from "../core/cameraTarget.js";
import { LANES } from "../game/lanes.js"

// Больше не экспортируем car как группу напрямую
export const car = new THREE.Group();
car.position.set(0, 0.25, 3);
car.userData = {
  isJumping: false,
  jumpVelocity: 0,
  targetPitch: 0,
  isDestroyed: false,      // флаг разрушения
  cubes: []                 // массив кубиков
};
scene.add(car);

// камера-таргет
cameraTarget.position.set(0, 0, -10);
car.add(cameraTarget);

// коллайдеры
export const carBox = new THREE.Box3();
export const carCollider = new THREE.Box3();

// текущее положение в полосе
export let currentLane = 1;

// Размеры коллайдера
const COLLIDER_SHRINK_X = 0.9;
const COLLIDER_SHRINK_Z = 0.9;
const COLLIDER_Y_OFFSET = 0.0;

const GLB_SCALES = [0.25, 0.25, 0.25];

// Конфигурация кубиков машины

const COLS = [-0.5, 0, 0.5];
const ROWS = [0.72, 0.25, -0.25, -0.72];
const HEIGHT = 0.17

// [x, y, z]
const CAR_CUBES_CONFIG = [
  // Ряд 1 (теперь задний, был передним) - 010
  { pos: [COLS[1], HEIGHT, ROWS[3]], scale: GLB_SCALES, color: 0xff4444, name: 'задний-центр' },

  // Ряд 2 (теперь предпоследний ряд) - 111
  { pos: [COLS[0], HEIGHT, ROWS[2]], scale: GLB_SCALES, color: 0xff6666, name: 'левый-2' },
  { pos: [COLS[1], HEIGHT, ROWS[2]], scale: GLB_SCALES, color: 0xff6666, name: 'центр-2' },
  { pos: [COLS[2], HEIGHT, ROWS[2]], scale: GLB_SCALES, color: 0xff6666, name: 'правый-2' },

  // Ряд 3 (теперь второй ряд) - 010
  { pos: [COLS[1], HEIGHT, ROWS[1]], scale: GLB_SCALES, color: 0xff8888, name: 'центр-3' },

  // Ряд 4 (теперь передний, был задним) - 101
  { pos: [COLS[0], HEIGHT, ROWS[0]], scale: GLB_SCALES, color: 0x44aaff, name: 'левый-передний' },
  { pos: [COLS[2], HEIGHT, ROWS[0]], scale: GLB_SCALES, color: 0x44aaff, name: 'правый-передний' },
];

// Кэш для загруженной модели кубика
let cubeModelCache = null;

export function moveLeft() {
  if (currentLane > 0 && !car.userData.isDestroyed) currentLane--;
  currentLane = Math.max(0, currentLane);
}

export function moveRight() {
  if (currentLane < LANES.length - 1 && !car.userData.isDestroyed) currentLane++;
  currentLane = Math.min(currentLane, LANES.length - 1);
}

function updateCarCollider() {
  if (car.userData.isDestroyed) return;

  carBox.setFromObject(car);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  carBox.getSize(size);
  carBox.getCenter(center);

  const colliderSize = new THREE.Vector3(
    size.x * COLLIDER_SHRINK_X,
    size.y * 0.8,
    size.z * COLLIDER_SHRINK_Z
  );

  const colliderCenter = new THREE.Vector3(
    center.x,
    center.y - COLLIDER_Y_OFFSET,
    center.z
  );

  const halfSize = colliderSize.clone().multiplyScalar(0.4);
  carCollider.min.copy(colliderCenter.clone().sub(halfSize));
  carCollider.max.copy(colliderCenter.clone().add(halfSize));
}

export function updatePlayer(max_car_tilt) {
  // Если машина разрушена, не обновляем движение
  if (car.userData.isDestroyed) return;

  const clampedLane = Math.min(Math.max(currentLane, 0), LANES.length - 1);
  const targetX = LANES[clampedLane];
  const deltaX = targetX - car.position.x;
  if (!isNaN(deltaX)) {
    car.position.x += deltaX * 0.2;
    car.rotation.y += (-deltaX * max_car_tilt - car.rotation.y) * 0.2;
  }
  if (car.userData.targetPitch !== undefined) {
    car.rotation.x += (car.userData.targetPitch - car.rotation.x) * 0.2;
  }

  carBox.setFromObject(car);
  updateCarCollider();
}

export function checkObstacleCollision(obstacle) {
  if (car.userData.isDestroyed) return false;

  const obstacleBox = new THREE.Box3().setFromObject(obstacle);
  return carCollider.intersectsBox(obstacleBox);
}

export function checkJumpCollision(jump) {
  if (car.userData.isDestroyed) return false;

  const jumpBox = new THREE.Box3().setFromObject(jump);
  const xDistance = Math.abs(car.position.x - jump.position.x);
  if (xDistance > 1.2) return false;
  const zDistance = Math.abs(car.position.z - jump.position.z);
  if (zDistance > 1.5) return false;
  return carCollider.intersectsBox(jumpBox);
}

// Функция для загрузки модели кубика
export function loadCubeModel(url) {
  return new Promise((resolve, reject) => {
    // Если уже загрузили, возвращаем из кэша
    if (cubeModelCache) {
      resolve(cubeModelCache);
      return;
    }

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        cubeModelCache = gltf.scene;
        resolve(cubeModelCache);
      },
      undefined,
      reject
    );
  });
}

// Функция для создания машины из кубиков
export async function buildCarFromCubes(cubeModelUrl, useGLB = true) {
  console.log('🚗 buildCarFromCubes started', { cubeModelUrl, useGLB });

  // Очищаем текущую машину
  console.log('Clearing existing car, children count:', car.children.length);
  while (car.children.length > 0) {
    car.remove(car.children[0]);
  }
  car.userData.cubes = [];

  if (useGLB && cubeModelUrl) {
    try {
      console.log('📦 Loading GLB model from:', cubeModelUrl);
      const cubeModel = await loadCubeModel(cubeModelUrl);
      console.log('✅ GLB model loaded, building cubes...');

      // Строим из GLB кубиков
      CAR_CUBES_CONFIG.forEach((config, index) => {
        const cube = cubeModel.clone();
        cube.position.set(config.pos[0], config.pos[1], config.pos[2]);
        cube.scale.set(config.scale[0], config.scale[1], config.scale[2]);

        cube.traverse((child) => {
          if (child.isMesh) {
            child.material = child.material.clone();
            child.material.color.setHex(config.color);
            child.castShadow = true;
            child.receiveShadow = true;
            console.log(`🎨 Cube ${index} material set:`, child.material.color.getHex());
          }
        });

        cube.userData = {
          originalPos: config.pos.slice(),
          originalScale: config.scale.slice(),
          configIndex: index,
          velocity: new THREE.Vector3(0, 0, 0),
          rotationSpeed: new THREE.Vector3(0, 0, 0)
        };

        car.add(cube);
        car.userData.cubes.push(cube);
        console.log(`➕ Added cube ${index} at position:`, config.pos);
      });

    } catch (error) {
      console.error('❌ Error loading GLB model, falling back to primitives:', error);
      buildFromPrimitives();
    }
  } else {
    console.log('🔨 Building car from primitives');
    buildFromPrimitives();
  }

  // Добавляем камеру обратно
  car.add(cameraTarget);

  // Обновляем коллайдеры
  carBox.setFromObject(car);
  updateCarCollider();

  console.log('✅ Car built, total cubes:', car.userData.cubes.length);
  console.log('Car position:', car.position);
  console.log('Car children:', car.children.length);

  // Временно добавим визуальный маркер для отладки
  // addDebugMarker();
}

// Временная функция для отладки - добавит яркий куб в центр машины
function addDebugMarker() {
  const debugGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const debugMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const debugCube = new THREE.Mesh(debugGeo, debugMat);
  debugCube.position.set(0, 1, 0);
  debugCube.name = 'debug-marker';
  car.add(debugCube);
  console.log('🎯 Added debug marker at', debugCube.position);
}

// Запасной вариант из примитивных кубов
function buildFromPrimitives() {
  CAR_CUBES_CONFIG.forEach((config) => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: config.color });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(config.pos[0], config.pos[1], config.pos[2]);
    cube.scale.set(config.scale[0], config.scale[1], config.scale[2]);

    cube.castShadow = true;
    cube.receiveShadow = true;

    cube.userData = {
      originalPos: config.pos.slice(),
      originalScale: config.scale.slice(),
      velocity: new THREE.Vector3(0, 0, 0),
      rotationSpeed: new THREE.Vector3(0, 0, 0)
    };

    car.add(cube);
    car.userData.cubes.push(cube);
  });
}

// Функция для разрушения машины
export function destroyCar(impactPoint = null) {
  if (car.userData.isDestroyed) return;

  car.userData.isDestroyed = true;

  // Отключаем камеру от машины
  car.remove(cameraTarget);
  scene.add(cameraTarget); // добавляем камеру в сцену отдельно

  // Разбрасываем кубики
  car.userData.cubes.forEach((cube) => {
    // Убираем кубик из группы car и добавляем прямо в сцену
    const worldPos = cube.getWorldPosition(new THREE.Vector3());
    const worldRot = cube.getWorldQuaternion(new THREE.Quaternion());

    car.remove(cube);
    scene.add(cube);

    cube.position.copy(worldPos);
    cube.quaternion.copy(worldRot);

    // Задаём случайную скорость для разлёта
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      Math.random() * 0.2 + 0.1,
      (Math.random() - 0.5) * 0.2
    );

    // Если есть точка удара, отталкиваемся от неё
    if (impactPoint) {
      const dir = cube.position.clone().sub(impactPoint).normalize();
      velocity.copy(dir.multiplyScalar(0.2));
    }

    cube.userData.velocity = velocity;
    cube.userData.rotationSpeed = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    );
  });
}

// Функция для анимации разлёта кубиков
export function updateDestroyedCubes() {
  if (!car.userData.isDestroyed) return;

  car.userData.cubes.forEach((cube) => {
    // Применяем физику
    cube.position.add(cube.userData.velocity);
    cube.rotation.x += cube.userData.rotationSpeed.x;
    cube.rotation.y += cube.userData.rotationSpeed.y;
    cube.rotation.z += cube.userData.rotationSpeed.z;

    // Простая гравитация
    cube.userData.velocity.y -= 0.005;

    // Если упал слишком низко, останавливаем или удаляем
    if (cube.position.y < -5) {
      scene.remove(cube);
    }
  });

  // Обновляем позицию камеры (она теперь отдельно)
  if (cameraTarget.parent === scene) {
    // Камера следует за местом разрушения
    const center = new THREE.Vector3();
    car.userData.cubes.forEach(cube => {
      center.add(cube.position);
    });
    if (car.userData.cubes.length > 0) {
      center.divideScalar(car.userData.cubes.length);
      cameraTarget.position.lerp(center, 0.1);
    }
  }
}

export function resetPlayer() {
  console.log('resetPlayer called');

  // Очищаем все кубики из сцены
  if (car.userData.cubes) {
    car.userData.cubes.forEach(cube => {
      scene.remove(cube);
    });
  }

  // Очищаем группу car
  while (car.children.length > 0) {
    car.remove(car.children[0]);
  }

  // Возвращаем камеру в машину
  car.add(cameraTarget);

  // Сбрасываем состояние
  currentLane = 1;
  car.position.set(0, 0.25, 3);
  car.rotation.set(0, 0, 0);
  car.userData = {
    isJumping: false,
    jumpVelocity: 0,
    targetPitch: 0,
    isDestroyed: false,
    cubes: []
  };

  // ВАЖНО: перестраиваем машину из кубиков!
  if (cubeModelCache) {
    console.log('Rebuilding car from cached model');
    rebuildCarFromCache();
  } else {
    console.log('No cached model, building from primitives');
    buildFromPrimitives();
  }

  carBox.setFromObject(car);
  updateCarCollider();

  console.log('resetPlayer finished, car children:', car.children.length);
}


// Новая функция для перестройки из кэша
function rebuildCarFromCache() {
  console.log('Rebuilding car from cache');

  CAR_CUBES_CONFIG.forEach((config, index) => {
    const cube = cubeModelCache.clone();
    cube.position.set(config.pos[0], config.pos[1], config.pos[2]);
    cube.scale.set(config.scale[0], config.scale[1], config.scale[2]);

    cube.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.setHex(config.color);
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    cube.userData = {
      originalPos: config.pos.slice(),
      originalScale: config.scale.slice(),
      configIndex: index,
      velocity: new THREE.Vector3(0, 0, 0),
      rotationSpeed: new THREE.Vector3(0, 0, 0)
    };

    car.add(cube);
    car.userData.cubes.push(cube);
  });

  // Добавляем debug marker
  // addDebugMarker();
}

export function createDebugCollider() {
  const oldDebug = scene.getObjectByName('debugCollider');
  if (oldDebug) scene.remove(oldDebug);

  const debugGeo = new THREE.BoxGeometry(1, 1, 1);
  const debugMat = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });
  const debugMesh = new THREE.Mesh(debugGeo, debugMat);
  debugMesh.name = 'debugCollider';

  function updateDebug() {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    carCollider.getSize(size);
    carCollider.getCenter(center);

    debugMesh.scale.copy(size);
    debugMesh.position.copy(center);
  }

  scene.add(debugMesh);
  return { debugMesh, updateDebug };
}