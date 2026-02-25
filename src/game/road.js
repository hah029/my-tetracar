import * as THREE from "three";
import { scene } from "../core/scene.js";
import { LANES } from "./lanes.js";

export const roadLines = [];

export function createRoad() {
  // сама дорога - полупрозрачная с флуоресцентным эффектом
  const roadWidth = 12;
  const roadLength = 200;
  const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength);

  // Создаём материал с эмиссивным свечением
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x88ccff,        // голубоватый оттенок
    emissive: 0x224466,      // тёмно-синее свечение
    transparent: true,
    opacity: 0.6,            // полупрозрачность
    side: THREE.DoubleSide   // видно с обеих сторон
  });

  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.z = -roadLength / 2 + 10;
  road.position.y = 0.01;
  road.receiveShadow = true;
  scene.add(road);

  // Добавляем свечение по краям дороги
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });

  // Левая граница
  const leftEdgePoints = [
    new THREE.Vector3(-6, 0.02, -90),
    new THREE.Vector3(-6, 0.02, 110)
  ];
  const leftEdgeGeometry = new THREE.BufferGeometry().setFromPoints(leftEdgePoints);
  const leftEdgeLine = new THREE.Line(leftEdgeGeometry, edgeMaterial);
  scene.add(leftEdgeLine);

  // Правая граница
  const rightEdgePoints = [
    new THREE.Vector3(6, 0.02, -90),
    new THREE.Vector3(6, 0.02, 110)
  ];
  const rightEdgeGeometry = new THREE.BufferGeometry().setFromPoints(rightEdgePoints);
  const rightEdgeLine = new THREE.Line(rightEdgeGeometry, edgeMaterial);
  scene.add(rightEdgeLine);

  // параметры пунктирной линии
  const segmentLength = 1.5; // длина одного сегмента
  const gap = 1.5;           // промежуток между сегментами
  const totalSegments = Math.ceil(roadLength / (segmentLength + gap)) + 10;

  // линии между полосами - теперь с флуоресцентным эффектом
  for (let i = 0; i < LANES.length - 1; i++) {
    const x = (LANES[i] + LANES[i + 1]) / 2;

    for (let j = 0; j < totalSegments; j++) {
      // Делаем линии более заметными и светящимися
      const lineGeometry = new THREE.BoxGeometry(0.1, 0.02, segmentLength);
      const lineMaterial = new THREE.MeshStandardMaterial({
        color: 0x44ffff,
        emissive: 0x226688,      // добавляем свечение
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.9
      });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);

      line.position.set(
        x,
        0.06,
        -segmentLength / 2 - j * (segmentLength + gap)
      );

      line.castShadow = false;
      line.receiveShadow = false;

      roadLines.push(line);
      scene.add(line);
    }
  }

  // Добавляем дополнительные декоративные линии для эффекта скорости
  addSpeedLines();
}

// Функция для добавления декоративных линий скорости
function addSpeedLines() {
  const lineCount = 20;
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x88aaff });

  for (let i = 0; i < lineCount; i++) {
    const x = (Math.random() - 0.5) * 10;
    const z = Math.random() * 200 - 100;

    const points = [
      new THREE.Vector3(x, 0.1, z),
      new THREE.Vector3(x + (Math.random() - 0.5) * 2, 0.1, z + 5)
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    line.userData.isSpeedLine = true;
    scene.add(line);
  }
}

export function updateRoadLines(speed) {
  // движение линий дороги
  roadLines.forEach(line => {
    line.position.z += speed;
    const segmentLength = 1.5;
    const gap = 1.5;
    const totalSegments = Math.ceil(200 / (segmentLength + gap)) + 10;

    if (line.position.z > 10) {
      line.position.z -= totalSegments * (segmentLength + gap);

      // Добавляем небольшое изменение цвета при сбросе для эффекта мерцания
      if (line.material.emissive) {
        const hue = Math.random() * 0.2 + 0.5; // голубые/синие тона
        line.material.emissive.setHSL(hue, 1, 0.3);
      }
    }
  });

  // Двигаем декоративные линии
  scene.children.forEach(child => {
    if (child.userData && child.userData.isSpeedLine) {
      child.position.z += speed * 0.5; // двигаются медленнее для эффекта глубины

      if (child.position.z > 20) {
        child.position.z = -80;
        // Случайно меняем позицию X для разнообразия
        child.position.x = (Math.random() - 0.5) * 8;
      }
    }
  });
}

// Альтернативный вариант с более ярким флуоресцентным эффектом
export function createNeonRoad() {
  // сама дорога с неоновым эффектом
  const roadWidth = 12;
  const roadLength = 200;
  const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength);

  // Используем шейдерный материал для более крутого эффекта
  const roadMaterial = new THREE.MeshPhongMaterial({
    color: 0x3366aa,
    emissive: 0x112244,
    shininess: 60,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });

  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.z = -roadLength / 2 + 10;
  road.position.y = 0.01;
  scene.add(road);

  // Добавляем неоновые полосы по бокам
  const neonMaterial = new THREE.LineBasicMaterial({ color: 0x44ffff });

  for (let i = -1; i <= 1; i += 2) {
    const points = [];
    for (let z = -90; z <= 110; z += 2) {
      points.push(new THREE.Vector3(i * 6 + Math.sin(z * 0.1) * 0.2, 0.05, z));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, neonMaterial);
    scene.add(line);
  }
}