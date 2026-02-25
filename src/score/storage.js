// src/score/storage.js
const KEY = "drag_race_high_score";

export function getHighScore() {
  return Number(localStorage.getItem(KEY)) || 0;
}

export function setHighScore(value) {
  localStorage.setItem(KEY, value);
}