// src/ui/mainMenu.js
// ui/mainMenu.js

import { setState, GameState } from "../state/gameState.js"
import { resetGame } from "../loop/resetGame.js";

let mainMenuElement = null;

export function createMainMenu() {
  if (mainMenuElement) return;

  const overlay = document.createElement('div');
  overlay.id = 'main-menu';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  `;

  const menu = document.createElement('div');
  menu.style.cssText = `
    text-align: center;
    color: white;
    font-family: Arial, sans-serif;
  `;

  menu.innerHTML = `
    <h1 style="font-size: 72px; margin-bottom: 50px; text-shadow: 0 0 20px rgba(0,255,255,0.5);">
      TETRACAR
    </h1>
    <button id="start-btn" style="
      background: none;
      color: white;
      border: none;
      padding: 20px 60px;
      margin: 10px;
      font-size: 24px;
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.3s;
    ">Начать игру</button>
  `;

  overlay.appendChild(menu);
  document.body.appendChild(overlay);
  mainMenuElement = overlay;

  document.getElementById('start-btn').addEventListener('click', () => {
    hideMainMenu();
    setState(GameState.PLAYING);
  });

}

export async function showMainMenu() {
  if (!mainMenuElement) {
    createMainMenu();
  }
  mainMenuElement.style.display = 'flex';

  await resetGame();
}

export function hideMainMenu() {
  if (mainMenuElement) {
    mainMenuElement.style.display = 'none';
  }
}