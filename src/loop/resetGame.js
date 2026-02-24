import { car } from "../game/player.js";
import { obstacles } from "../game/obstacles.js";
import { scene } from "../core/scene.js";
import { resetScore } from "../score/score.js";

export function resetGame() {
  car.position.set(0, 0.25, 3);

  for (const o of obstacles) {
    scene.remove(o);
  }
  obstacles.length = 0;

  resetScore();
}