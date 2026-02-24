export const LANES = [-3, -1, 1, 3];

export function getLaneX(index) {
  return LANES[index];
}

export function getRandomLane() {
  return Math.floor(Math.random() * LANES.length);
}