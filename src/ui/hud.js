// src/ui/hud.js
// ui/hud.js
import { score, highScore } from "../score/score.js";
import { gameData } from "../state/gameState.js";

let hud;
let nitroBar;
let speedNeedle;
let speedValue;

export function initHUD() {
  // Основной контейнер HUD
  hud = document.createElement("div");
  hud.id = "game-hud";
  hud.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    font-family: 'Segoe UI', 'Arial', sans-serif;
    z-index: 5;
  `;
  document.body.appendChild(hud);

  // Левый верхний угол - очки
  const scorePanel = document.createElement("div");
  scorePanel.id = "score-panel";
  scorePanel.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    border-radius: 15px;
    padding: 15px 25px;
    color: white;
    border-left: 4px solid #ffd700;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  `;

  scorePanel.innerHTML = `
    <div style="font-size: 14px; opacity: 0.7; letter-spacing: 2px;">SCORE</div>
    <div id="score-value" style="font-size: 36px; font-weight: bold; color: #ffd700; text-shadow: 0 0 10px rgba(255,215,0,0.3);">0</div>
    <div style="font-size: 12px; opacity: 0.5; margin-top: 5px;">BEST <span id="best-value" style="color: #fff; font-weight: bold;">0</span></div>
  `;
  hud.appendChild(scorePanel);

  // Правый верхний угол - спидометр
  const speedPanel = document.createElement("div");
  speedPanel.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    border-radius: 15px;
    padding: 15px 25px;
    color: white;
    border-right: 4px solid #00ffff;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    text-align: right;
    pointer-events: none;
  `;

  speedPanel.innerHTML = `
    <div style="font-size: 14px; opacity: 0.7; letter-spacing: 2px;">SPEED</div>
    <div id="speed-value" style="font-size: 36px; font-weight: bold; color: #00ffff; text-shadow: 0 0 10px rgba(0,255,255,0.3);">0</div>
    <div style="font-size: 12px; opacity: 0.5;">KM/H</div>
  `;
  hud.appendChild(speedPanel);

  // Нижняя часть - индикатор нитро
  const nitroContainer = document.createElement("div");
  nitroContainer.style.cssText = `
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    border-radius: 50px;
    padding: 10px 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  `;

  nitroContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: white;">
      <span style="font-size: 12px; opacity: 0.7;">NITRO</span>
      <span id="nitro-status" style="font-size: 12px; font-weight: bold; color: #ff4444;">INACTIVE</span>
    </div>
    <div style="width: 100%; height: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; overflow: hidden;">
      <div id="nitro-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ff4444, #ff8844); border-radius: 10px; transition: width 0.2s ease;"></div>
    </div>
  `;
  hud.appendChild(nitroContainer);

  // Индикатор полосы движения (снизу слева)
  const laneIndicator = document.createElement("div");
  laneIndicator.id = "lane-indicator";
  laneIndicator.style.cssText = `
    position: absolute;
    bottom: 30px;
    left: 30px;
    display: flex;
    gap: 10px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    padding: 10px;
    border-radius: 50px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    pointer-events: none;
  `;

  // Создаём 4 точки для 4 полос
  for (let i = 0; i < 4; i++) {
    const dot = document.createElement("div");
    dot.id = `lane-dot-${i}`;
    dot.style.cssText = `
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.5);
      transition: all 0.2s ease;
    `;
    laneIndicator.appendChild(dot);
  }
  hud.appendChild(laneIndicator);

  // Предупреждение об опасности (скрыто по умолчанию)
  const warning = document.createElement("div");
  warning.id = "warning-message";
  warning.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ff4444;
    font-size: 48px;
    font-weight: bold;
    text-shadow: 0 0 20px rgba(255,0,0,0.5);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 10;
  `;
  warning.textContent = "⚠️ DANGER ⚠️";
  hud.appendChild(warning);

  // Сохраняем ссылки на изменяемые элементы
  window.hudElements = {
    scoreValue: document.getElementById('score-value'),
    bestValue: document.getElementById('best-value'),
    speedValue: document.getElementById('speed-value'),
    nitroBar: document.getElementById('nitro-bar'),
    nitroStatus: document.getElementById('nitro-status'),
    warning: warning,
    laneDots: [
      document.getElementById('lane-dot-0'),
      document.getElementById('lane-dot-1'),
      document.getElementById('lane-dot-2'),
      document.getElementById('lane-dot-3')
    ]
  };
}

export function updateHUD(speed, currentLane, dangerLevel) {
  if (!window.hudElements) return;

  const elements = window.hudElements;

  // Обновляем счёт
  elements.scoreValue.textContent = Math.floor(score);
  elements.bestValue.textContent = Math.floor(highScore);

  // Обновляем скорость (округляем до 1 знака)
  elements.speedValue.textContent = (speed * 100).toFixed(1);

  // Обновляем нитро
  if (gameData.is_nitro_enabled) {
    elements.nitroBar.style.width = "100%";
    elements.nitroStatus.textContent = "ACTIVE";
    elements.nitroStatus.style.color = "#44ff44";
    elements.nitroBar.style.background = "linear-gradient(90deg, #44ff44, #88ff88)";
  } else {
    elements.nitroBar.style.width = "0%";
    elements.nitroStatus.textContent = "INACTIVE";
    elements.nitroStatus.style.color = "#ff4444";
    elements.nitroBar.style.background = "linear-gradient(90deg, #ff4444, #ff8844)";
  }

  // Обновляем индикатор полосы
  if (elements.laneDots && currentLane !== undefined) {
    elements.laneDots.forEach((dot, index) => {
      if (index === currentLane) {
        dot.style.background = "#00ffff";
        dot.style.boxShadow = "0 0 15px #00ffff";
        dot.style.transform = "scale(1.2)";
      } else {
        dot.style.background = "rgba(255, 255, 255, 0.3)";
        dot.style.boxShadow = "none";
        dot.style.transform = "scale(1)";
      }
    });
  }

  // Показываем предупреждение об опасности
  if (dangerLevel > 0) {
    elements.warning.style.opacity = Math.min(dangerLevel, 1);
    // Меняем цвет в зависимости от уровня опасности
    const intensity = Math.floor(255 * dangerLevel);
    elements.warning.style.color = `rgb(255, ${255 - intensity}, ${255 - intensity})`;
    elements.warning.style.textShadow = `0 0 ${20 * dangerLevel}px rgba(255,0,0,${dangerLevel})`;

    // Добавляем пульсацию при высокой опасности
    if (dangerLevel > 0.7) {
      elements.warning.style.transform = `translate(-50%, -50%) scale(${1 + Math.sin(Date.now() * 0.01) * 0.1})`;
    } else {
      elements.warning.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  } else {
    elements.warning.style.opacity = '0';
  }
}

// Добавляем анимацию пульсации для нитро при активации
export function pulseNitro() {
  if (!window.hudElements?.nitroBar) return;

  window.hudElements.nitroBar.style.transition = "all 0.1s ease";
  window.hudElements.nitroBar.style.transform = "scaleX(1.1)";

  setTimeout(() => {
    if (window.hudElements?.nitroBar) {
      window.hudElements.nitroBar.style.transform = "scaleX(1)";
      setTimeout(() => {
        if (window.hudElements?.nitroBar) {
          window.hudElements.nitroBar.style.transition = "width 0.2s ease";
        }
      }, 100);
    }
  }, 100);
}