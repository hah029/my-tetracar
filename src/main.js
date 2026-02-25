import { animate } from "./loop/animate.js";
import { initHUD } from "./ui/hud.js";
import { createRoad } from "./game/road.js";
import { createSideObjects } from "./game/roadObjects.js";
import { spawnRow } from "./game/spawnRow.js";
import { gameData } from "./state/gameState.js";
import { buildCarFromCubes } from './game/player.js';
import { showMainMenu } from "./ui/mainMenu.js";

import "./game/controls.js";

createRoad();
createSideObjects();
initHUD();

// Асинхронная функция для инициализации игры
async function initGame() {
    try {
        console.log('Loading cube model from /models/cube.glb...');

        // ТОЛЬКО ОДИН РАЗ строим машину
        await buildCarFromCubes('/models/cube.glb', true);

        console.log('Car built successfully!');
    } catch (error) {
        console.error('Failed to build car from cubes, using fallback:', error);
        await buildCarFromCubes(null, false);
    }

    showMainMenu();
    setInterval(() => spawnRow(gameData.speed), 1200);
    animate();
}

// Запускаем инициализацию ТОЛЬКО ОДИН РАЗ
initGame();