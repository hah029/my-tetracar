import { score, highScore } from "../score/score.js";

let hud;

export function initHUD() {
  hud = document.createElement("div");
  hud.style.position = "absolute";
  hud.style.top = "20px";
  hud.style.left = "20px";
  hud.style.color = "white";
  hud.style.fontFamily = "Arial";
  hud.style.fontSize = "20px";
  hud.style.zIndex = "5";
  document.body.appendChild(hud);
}

export function updateHUD(speed) {
  if (!hud) return;
  hud.innerHTML = `
    SCORE: ${Math.floor(score)}<br/>
    BEST: ${Math.floor(highScore)}<br/>
    SPEED: ${speed}
  `;
}