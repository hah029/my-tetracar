export const GameState = {
  MENU: "menu",
  PLAYING: "playing",
  GAME_OVER: "gameover",
  PAUSED: "paused",
};
export const baseSpeed = 0.5;
export const nitroMultiplier = 2.5; // множитель скорости при нитро
export const gameData = {
  speed: baseSpeed,
  baseSpeed: baseSpeed,
  acceleration: 0.002,
  is_nitro_enabled: false,
  nitroMultiplier: nitroMultiplier,
  maxSpeed: 3.0,
};

export let currentState = GameState.MENU;

export function setState(newState) {
  currentState = newState;
}
export function enableNitro() {
  if (!gameData.is_nitro_enabled) {
    gameData.is_nitro_enabled = true;
    // Не меняем speed напрямую, так как она будет пересчитываться в animate
  }
}

export function disableNitro() {
  if (gameData.is_nitro_enabled) {
    gameData.is_nitro_enabled = false;
  }
}

export function isNitroEnabled() {
  return gameData.is_nitro_enabled;
}

// Функция для получения текущей скорости с учётом нитро
export function getCurrentSpeed() {
  let currentSpeed = gameData.baseSpeed;

  // Применяем нитро если включено
  if (gameData.is_nitro_enabled) {
    currentSpeed *= gameData.nitroMultiplier;
  }

  return currentSpeed;
}

export function resetGameData() {
  gameData.baseSpeed = baseSpeed;
  gameData.speed = baseSpeed;
  gameData.is_nitro_enabled = false;
}