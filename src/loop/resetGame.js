export async function resetGame() {
  await Promise.all([
    import('../game/player.js').then(module => module.resetPlayer?.()),
    import('../game/obstacles.js').then(module => module.resetObstacles?.()),
    import('../game/jumps.js').then(module => module.resetJumps?.()),
    import('../score/score.js').then(module => module.resetScore?.()),
    import('../state/gameState.js').then(module => module.resetGameData?.())
  ]);
}