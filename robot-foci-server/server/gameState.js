function createGameState() {
  return {
    ball: { x: 300, y: 200, vx: 0, vy: 0 },
    players: [
      { x: 100, y: 200, direction: null },
      { x: 500, y: 200, direction: null },
    ],
    score: [0, 0],
    gameOver: false,
  };
}

function resetPositions(state) {
  state.ball = { x: 300, y: 200, vx: 0, vy: 0 };
  state.players[0] = { x: 100, y: 200, direction: null };
  state.players[1] = { x: 500, y: 200, direction: null };
}

function updateGameState(state) {
  if (state.gameOver) return;

  const speed = 5;
  const kickPower = 6;
  const playerRadius = 18;
  const ballRadius = 8;
  const fieldWidth = 600;
  const fieldHeight = 400;

  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];

    switch (player.direction) {
      case "up":
        player.y -= speed;
        break;
      case "down":
        player.y += speed;
        break;
      case "left":
        player.x -= speed;
        break;
      case "right":
        player.x += speed;
        break;
    }

    player.x = Math.max(
      playerRadius,
      Math.min(fieldWidth - playerRadius, player.x)
    );
    player.y = Math.max(
      playerRadius,
      Math.min(fieldHeight - playerRadius, player.y)
    );
  }

  const p1 = state.players[0];
  const p2 = state.players[1];
  const dxP = p2.x - p1.x;
  const dyP = p2.y - p1.y;
  const distP = Math.sqrt(dxP * dxP + dyP * dyP);
  const minDistP = playerRadius * 2;

  if (distP < minDistP && distP > 0) {
    const overlap = (minDistP - distP) / 2;
    const normX = dxP / distP;
    const normY = dyP / distP;

    p1.x -= normX * overlap;
    p1.y -= normY * overlap;
    p2.x += normX * overlap;
    p2.y += normY * overlap;
  }

  state.ball.x += state.ball.vx;
  state.ball.y += state.ball.vy;

  state.ball.vx *= 0.98;
  state.ball.vy *= 0.98;

  if (state.ball.x < ballRadius || state.ball.x > fieldWidth - ballRadius) {
    state.ball.vx *= -1;
    state.ball.x = Math.max(
      ballRadius,
      Math.min(fieldWidth - ballRadius, state.ball.x)
    );
  }
  if (state.ball.y < ballRadius || state.ball.y > fieldHeight - ballRadius) {
    state.ball.vy *= -1;
    state.ball.y = Math.max(
      ballRadius,
      Math.min(fieldHeight - ballRadius, state.ball.y)
    );
  }

  let totalPushX = 0;
  let totalPushY = 0;

  for (const player of state.players) {
    const dx = state.ball.x - player.x;
    const dy = state.ball.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = playerRadius + ballRadius;

    if (dist < minDist && dist > 0) {
      switch (player.direction) {
        case "up":
          state.ball.vy = -kickPower;
          break;
        case "down":
          state.ball.vy = kickPower;
          break;
        case "left":
          state.ball.vx = -kickPower;
          break;
        case "right":
          state.ball.vx = kickPower;
          break;
      }

      const overlap = minDist - dist;
      const normX = dx / dist;
      const normY = dy / dist;
      totalPushX += normX * overlap;
      totalPushY += normY * overlap;
    }
  }

  state.ball.x += totalPushX;
  state.ball.y += totalPushY;

  const goalTop = 140;
  const goalBottom = 260;

  if (state.ball.y >= goalTop && state.ball.y <= goalBottom) {
    if (state.ball.x <= ballRadius) {
      state.score[1] += 1;
      if (state.score[1] >= 5) {
        state.gameOver = true;
      } else {
        resetPositions(state);
      }
    } else if (state.ball.x >= fieldWidth - ballRadius) {
      state.score[0] += 1;
      if (state.score[0] >= 5) {
        state.gameOver = true;
      } else {
        resetPositions(state);
      }
    }
  }
}

module.exports = {
  createGameState,
  updateGameState,
};
