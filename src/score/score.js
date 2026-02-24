import { getHighScore, setHighScore } from "./storage.js";

export let score = 0;
export let highScore = getHighScore();

export function resetScore() {
  score = 0;
}

export function addScore(value = 1) {
  score += value;

  if (score > highScore) {
    highScore = score;
    setHighScore(highScore);
  }
}