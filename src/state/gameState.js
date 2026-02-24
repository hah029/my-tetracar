export const GameState = {
  MENU: "menu",
  PLAYING: "playing",
  GAME_OVER: "gameover"
};
export const gameData = { speed: 0.5 };

export let currentState = GameState.MENU;

export function setState(newState) {
  currentState = newState;
}