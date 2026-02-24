import * as THREE from "three";
import { scene } from "../core/scene.js";
import { LANES } from "./player.js";

export const roadLines = [];

export function createRoad() {
  // сама дорога
  const roadWidth = 12;
  const roadLength = 200;
  const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength);
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.z = -roadLength / 2;
  scene.add(road);

  // параметры пунктирной линии
  const segmentLength = 1.5; // длина одного сегмента
  const gap = 1.5;           // промежуток между сегментами
  const totalSegments = Math.ceil(roadLength / (segmentLength + gap)) + 10; 
  // +10 чтобы покрыть полностью видимую область

  // линии между полосами
  for (let i = 0; i < LANES.length - 1; i++) {
    const x = (LANES[i] + LANES[i + 1]) / 2;

    for (let j = 0; j < totalSegments; j++) {
      const lineGeometry = new THREE.BoxGeometry(0.05, 0.01, segmentLength);
      const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);

      line.position.set(
        x,
        0.05,
        -segmentLength / 2 - j * (segmentLength + gap)
      );

      roadLines.push(line);
      scene.add(line);
    }
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
      }
    });
}