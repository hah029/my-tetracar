// src/core/renderer.js
import * as THREE from "three";

export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });

function updateRendererSize() {
  // Получаем реальные размеры окна
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Логируем для отладки
  console.log('Window size:', width, 'x', height);

  // Устанавливаем размер
  renderer.setSize(width, height);

  // Проверяем, совпадает ли CSS размер с реальным
  const canvas = renderer.domElement;
  console.log('Canvas CSS size:', canvas.style.width, canvas.style.height);
  console.log('Canvas actual size:', canvas.width, 'x', canvas.height);
}

// Сбрасываем все стили body
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';

// Стили для canvas
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
renderer.domElement.style.objectFit = 'cover'; // важно!

updateRendererSize();
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  updateRendererSize();

  // Также обновляем соотношение сторон камеры, если нужно
  // camera.aspect = window.innerWidth / window.innerHeight;
  // camera.updateProjectionMatrix();
});