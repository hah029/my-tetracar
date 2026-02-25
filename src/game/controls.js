// src/game/controls.js
import { moveLeft, moveRight } from "../game/player.js";
import { enableNitro, disableNitro, currentState, GameState, setState } from "../state/gameState.js";
import { togglePauseMenu } from "../ui/menu.js"

window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") {
    e.preventDefault();
  }

  if (e.key === "ArrowLeft") {
    console.log("LEFT pressed");
    moveLeft();
  }
  if (e.key === "ArrowRight") {
    console.log("RIGHT pressed");
    moveRight();
  }
  if (e.key === " ") { // Space
    console.log("Space pressed");
    enableNitro();
  }
  if (e.key === "Escape") { // Space
    console.log("Escape pressed");
    processEscape();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === " ") { // Space
    e.preventDefault();
    console.log("Space released");
    disableNitro();
  }
});



function processEscape() {
  console.log("Escape pressed, current state:", currentState);

  switch (currentState) {
    case GameState.PLAYING:
      // Если игра идёт - ставим на паузу и показываем меню
      setState(GameState.PAUSED);
      togglePauseMenu(true);
      break;

    case GameState.PAUSED:
      // Если на паузе - возвращаемся в игру
      setState(GameState.PLAYING);
      togglePauseMenu(false);
      break;

    case GameState.MENU:
      // В главном меню Escape может ничего не делать или возвращать в предыдущее меню
      console.log("Already in menu");
      break;

    case GameState.GAME_OVER:
      // В экране game over можно предложить вернуться в меню
      // Например:
      setState(GameState.MENU);
      showMainMenu();
      break;
  }
}