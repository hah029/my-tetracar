import { animate } from "./loop/animate.js";
import { showMenu } from "./ui/screens.js";
import { initHUD } from "./ui/hud.js";
import { createRoad } from "./game/road.js";
import { createSideObjects } from "./game/roadObjects.js";
import { spawnRow } from "./game/spawnRow.js";
import { gameData } from "./state/gameState.js";

import "./game/controls.js";

createRoad();
createSideObjects();
initHUD();
showMenu();

// спавн рядов с передачей скорости
setInterval(() => spawnRow(gameData.speed), 1500);

animate();