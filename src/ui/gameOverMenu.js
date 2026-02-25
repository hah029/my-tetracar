// ui/gameOverMenu.js
import { GameState, setState } from "../state/gameState.js";
import { score, highScore } from "../score/score.js";
import { resetGame } from "../loop/resetGame.js";

let gameOverMenuElement = null;

export function createGameOverMenu() {
    if (gameOverMenuElement) return;

    // Создаём затемнённый фон с эффектом размытия
    const overlay = document.createElement('div');
    overlay.id = 'gameover-overlay';
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    opacity: 0;
    transition: opacity 0.5s ease;
    font-family: 'Segoe UI', 'Arial', sans-serif;
  `;

    // Создаём контейнер меню
    const menuContainer = document.createElement('div');
    menuContainer.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    padding: 50px;
    border-radius: 30px;
    text-align: center;
    color: white;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transform: scale(0.9);
    transition: transform 0.5s ease;
    max-width: 500px;
    width: 90%;
  `;

    // Заголовок GAME OVER с анимацией
    const gameOverTitle = document.createElement('h1');
    gameOverTitle.textContent = 'GAME OVER';
    gameOverTitle.style.cssText = `
    font-size: 64px;
    margin-bottom: 20px;
    background: linear-gradient(45deg, #ff4444, #ff8844);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(255,68,68,0.3);
    animation: pulse 2s infinite;
    letter-spacing: 4px;
  `;

    // Стили для анимации пульсации
    const style = document.createElement('style');
    style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
    document.head.appendChild(style);

    // Контейнер для счёта
    const scoreContainer = document.createElement('div');
    scoreContainer.style.cssText = `
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 30px;
    margin: 30px 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `;

    // Текущий счёт
    const currentScore = document.createElement('div');
    currentScore.style.cssText = `
    font-size: 18px;
    opacity: 0.8;
    margin-bottom: 10px;
  `;
    currentScore.textContent = 'YOUR SCORE';

    const currentScoreValue = document.createElement('div');
    currentScoreValue.id = 'gameover-current-score';
    currentScoreValue.style.cssText = `
    font-size: 48px;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 0 0 20px rgba(255,215,0,0.5);
    margin-bottom: 20px;
  `;

    // Лучший счёт
    const bestScore = document.createElement('div');
    bestScore.style.cssText = `
    font-size: 16px;
    opacity: 0.7;
    margin-bottom: 5px;
  `;
    bestScore.textContent = 'BEST SCORE';

    const bestScoreValue = document.createElement('div');
    bestScoreValue.id = 'gameover-best-score';
    bestScoreValue.style.cssText = `
    font-size: 24px;
    color: #00ffff;
    text-shadow: 0 0 15px rgba(0,255,255,0.5);
  `;

    scoreContainer.appendChild(currentScore);
    scoreContainer.appendChild(currentScoreValue);
    scoreContainer.appendChild(bestScore);
    scoreContainer.appendChild(bestScoreValue);

    // Контейнер для кнопок
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 30px;
  `;

    // Кнопка "Играть снова"
    const restartBtn = document.createElement('button');
    restartBtn.id = 'restart-btn';
    restartBtn.textContent = '🔄 ИГРАТЬ СНОВА';
    restartBtn.style.cssText = `
    background: linear-gradient(90deg, #4CAF50, #45a049);
    color: white;
    border: none;
    padding: 18px 30px;
    font-size: 20px;
    font-weight: bold;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: 2px;
    border: 1px solid rgba(255,255,255,0.2);
  `;

    // Кнопка "Главное меню"
    const menuBtn = document.createElement('button');
    menuBtn.id = 'menu-btn';
    menuBtn.textContent = '🏠 ГЛАВНОЕ МЕНЮ';
    menuBtn.style.cssText = `
    background: linear-gradient(90deg, #2196F3, #1976D2);
    color: white;
    border: none;
    padding: 18px 30px;
    font-size: 20px;
    font-weight: bold;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: 2px;
    border: 1px solid rgba(255,255,255,0.2);
  `;

    // Добавляем эффекты наведения
    [restartBtn, menuBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-3px)';
            btn.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = 'none';
        });
    });

    buttonsContainer.appendChild(restartBtn);
    buttonsContainer.appendChild(menuBtn);

    // Собираем всё вместе
    menuContainer.appendChild(gameOverTitle);
    menuContainer.appendChild(scoreContainer);
    menuContainer.appendChild(buttonsContainer);
    overlay.appendChild(menuContainer);
    document.body.appendChild(overlay);

    gameOverMenuElement = overlay;

    // Добавляем обработчики
    document.getElementById('restart-btn').addEventListener('click', () => {
        hideGameOverMenu();
        restartGame();
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
        hideGameOverMenu();
        goToMainMenu();
    });

    // Обработчик клавиши Enter для быстрого рестарта
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && gameOverMenuElement.style.display === 'flex') {
            hideGameOverMenu();
            restartGame();
        }
    });
}

export function showGameOverMenu() {
    if (!gameOverMenuElement) {
        createGameOverMenu();
    }

    // Обновляем значения счёта
    const currentScoreElement = document.getElementById('gameover-current-score');
    const bestScoreElement = document.getElementById('gameover-best-score');

    if (currentScoreElement) {
        currentScoreElement.textContent = Math.floor(score);
    }

    if (bestScoreElement) {
        bestScoreElement.textContent = Math.floor(highScore);

        // Если установлен новый рекорд, добавляем эффект
        if (score >= highScore) {
            bestScoreElement.style.color = '#ffd700';
            bestScoreElement.style.textShadow = '0 0 20px rgba(255,215,0,0.8)';
            bestScoreElement.innerHTML = '🏆 ' + Math.floor(highScore) + ' 🏆';

            // Показываем сообщение о новом рекорде
            showNewRecordMessage();
        }
    }

    // Показываем меню с анимацией
    gameOverMenuElement.style.display = 'flex';

    // Небольшая задержка для анимации
    setTimeout(() => {
        gameOverMenuElement.style.opacity = '1';
        const menuContainer = gameOverMenuElement.querySelector('div > div');
        if (menuContainer) {
            menuContainer.style.transform = 'scale(1)';
        }
    }, 10);
}

export function hideGameOverMenu() {
    if (!gameOverMenuElement) return;

    gameOverMenuElement.style.opacity = '0';
    const menuContainer = gameOverMenuElement.querySelector('div > div');
    if (menuContainer) {
        menuContainer.style.transform = 'scale(0.9)';
    }

    // Скрываем после анимации
    setTimeout(() => {
        gameOverMenuElement.style.display = 'none';
    }, 500);
}

// Функция для сообщения о новом рекорде
function showNewRecordMessage() {
    const existingMessage = document.getElementById('new-record-message');
    if (existingMessage) return;

    const message = document.createElement('div');
    message.id = 'new-record-message';
    message.style.cssText = `
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(90deg, #ffd700, #ffaa00);
    color: #000;
    padding: 10px 30px;
    border-radius: 50px;
    font-weight: bold;
    font-size: 18px;
    white-space: nowrap;
    animation: slideDown 0.5s ease;
    box-shadow: 0 5px 20px rgba(255,215,0,0.5);
  `;
    message.textContent = '✨ НОВЫЙ РЕКОРД! ✨';

    const menuContainer = gameOverMenuElement.querySelector('div > div');
    if (menuContainer) {
        menuContainer.style.position = 'relative';
        menuContainer.appendChild(message);

        // Удаляем через 3 секунды
        setTimeout(() => {
            if (message && message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
}

// Функция рестарта игры
async function restartGame() {
    await resetGame();
    setState(GameState.PLAYING);
}

// Функция возврата в главное меню
function goToMainMenu() {
    setState(GameState.MENU);
    import('./mainMenu.js').then(module => {
        module.showMainMenu();
    });
}