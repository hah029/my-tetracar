// src/ui/menu.js
// ui/menu.js
import { GameState, setState } from "../state/gameState.js";
import { showMainMenu } from "./mainMenu.js"

// Создаём DOM-элементы для меню паузы
let pauseMenuElement = null;

export function createPauseMenu() {
    if (pauseMenuElement) return;

    // Создаём затемнённый фон
    const overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

    // Создаём меню
    const menu = document.createElement('div');
    menu.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    color: white;
    font-family: Arial, sans-serif;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  `;

    menu.innerHTML = `
    <h1 style="margin-bottom: 30px; font-size: 48px;">ПАУЗА</h1>
    <button id="resume-btn" style="
      background: #4CAF50;
      color: white;
      border: none;
      padding: 15px 40px;
      margin: 10px;
      font-size: 20px;
      border-radius: 10px;
      cursor: pointer;
      transition: transform 0.2s;
    ">Продолжить</button>
    <button id="menu-btn" style="
      background: #f44336;
      color: white;
      border: none;
      padding: 15px 40px;
      margin: 10px;
      font-size: 20px;
      border-radius: 10px;
      cursor: pointer;
      transition: transform 0.2s;
    ">Выйти в меню</button>
  `;

    overlay.appendChild(menu);
    document.body.appendChild(overlay);
    pauseMenuElement = overlay;

    // Добавляем обработчики
    document.getElementById('resume-btn').addEventListener('click', () => {
        togglePauseMenu(false);
        setState(GameState.PLAYING);
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
        togglePauseMenu(false);
        setState(GameState.MENU);
        // Здесь нужно будет показать главное меню
        showMainMenu();
    });

    // Эффекты наведения
    const buttons = menu.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
    });
}

export function togglePauseMenu(show) {
    if (!pauseMenuElement) {
        createPauseMenu();
    }
    pauseMenuElement.style.display = show ? 'flex' : 'none';
}
