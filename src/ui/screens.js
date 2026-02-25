// src/ui/screens.js
import { GameState, setState } from "../state/gameState.js";
import { resetGame } from "../loop/resetGame.js";

function createOverlay() {
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.inset = "0";
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.background = "rgba(0,0,0,0.6)";
  div.style.color = "white";
  div.style.fontFamily = "Arial";
  div.style.zIndex = "10";
  return div;
}

export function showMenu() {
  const menu = createOverlay();

  const title = document.createElement("h1");
  title.innerText = "TETRA CARP";

  const btn = document.createElement("button");
  btn.innerText = "СТАРТ";
  btn.style.fontSize = "18px";
  btn.style.padding = "2px";

  btn.onclick = () => {
    document.body.removeChild(menu);
    setState(GameState.PLAYING);
  };

  menu.append(title, btn);
  document.body.appendChild(menu);
}

export function showGameOver() {
  const over = createOverlay();

  const title = document.createElement("h1");
  title.innerText = "ПОТРАЧЕНО";

  const btn = document.createElement("button");
  btn.innerText = "ПОВТОРИТЬ";
  btn.style.fontSize = "18px";
  btn.style.padding = "2px";

  btn.onclick = () => {
    document.body.removeChild(over);
    resetGame();
    setState(GameState.PLAYING);
  };

  over.append(title, btn);
  document.body.appendChild(over);
}