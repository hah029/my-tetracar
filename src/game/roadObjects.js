import * as THREE from "three";
import { scene } from "../core/scene.js";

export const sideObjects = [];

// создаём обочину с разными объектами
export function createSideObjects() {
  const roadLength = 200;
  const spacing = 7; // расстояние между объектами по Z

  // параметры объектов: [geometry, material, yOffset]
  const objectTypes = [
    [new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xffff00 }), 0], // столбик
    // [new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshStandardMaterial({ color: 0x00ff00 }), 0.5],   // знак
    // [new THREE.ConeGeometry(0.5, 0.2, 8), new THREE.MeshStandardMaterial({ color: 0x964B00 }), 0.75]   // дерево
  ];

  const laneOffset = 6; // расстояние от центра дороги

  for (let z = -roadLength; z <= 10; z += spacing) {
    for (const side of [-1, 1]) { // левый и правый ряды
      const [geo, mat, yOffset] = objectTypes[Math.floor(Math.random() * objectTypes.length)];
      const obj = new THREE.Mesh(geo, mat);
      obj.position.set(laneOffset * side, yOffset, z);
      scene.add(obj);
      sideObjects.push(obj);
    }
  }
}

// обновление позиции объектов по скорости
export function updateSideObjects(speed) {
  for (let i = sideObjects.length - 1; i >= 0; i--) {
    sideObjects[i].position.z += speed;

    // если объект вышел за камеру, переносим его назад
    if (sideObjects[i].position.z > 10) {
      sideObjects[i].position.z -= 210; // roadLength + запас
      // sideObjects[i].position.x += (Math.random() * 0.5 - 0.25); // небольшое смещение по X
      // sideObjects[i].position.z += Math.random() * 2 - 1; // небольшой рандом по Z
    }
  }
}