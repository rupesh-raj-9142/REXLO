// Carrom Game Logic
class CarromGame {
  constructor(gameId, players) {
    this.gameId = gameId;
    this.players = players; // Array of player IDs
    this.currentPlayer = 0;
    this.state = 'waiting'; // waiting, aiming, shooting, finished
    this.board = this.initializeBoard();
    this.striker = { x: 200, y: 400, vx: 0, vy: 0, isMoving: false };
    this.scores = {};
    this.winner = null;
    this.turnStartTime = null;
    this.timeLimit = 30; // 30 seconds per turn
  }

  initializeBoard() {
    return {
      coins: [
        // Queen (center)
        { id: 'queen', x: 200, y: 200, type: 'queen', active: true },
        // White coins
        { id: 'w1', x: 180, y: 180, type: 'white', active: true },
        { id: 'w2', x: 220, y: 180, type: 'white', active: true },
        { id: 'w3', x: 180, y: 220, type: 'white', active: true },
        { id: 'w4', x: 220, y: 220, type: 'white', active: true },
        { id: 'w5', x: 200, y: 160, type: 'white', active: true },
        { id: 'w6', x: 200, y: 240, type: 'white', active: true },
        { id: 'w7', x: 160, y: 200, type: 'white', active: true },
        { id: 'w8', x: 240, y: 200, type: 'white', active: true },
        { id: 'w9', x: 160, y: 160, type: 'white', active: true },
        // Black coins
        { id: 'b1', x: 160, y: 240, type: 'black', active: true },
        { id: 'b2', x: 240, y: 160, type: 'black', active: true },
        { id: 'b3', x: 240, y: 240, type: 'black', active: true },
        { id: 'b4', x: 140, y: 180, type: 'black', active: true },
        { id: 'b5', x: 260, y: 180, type: 'black', active: true },
        { id: 'b6', x: 140, y: 220, type: 'black', active: true },
        { id: 'b7', x: 260, y: 220, type: 'black', active: true },
        { id: 'b8', x: 180, y: 140, type: 'black', active: true },
        { id: 'b9', x: 220, y: 140, type: 'black', active: true },
      ],
      pockets: [
        { x: 20, y: 20 },
        { x: 380, y: 20 },
        { x: 20, y: 380 },
        { x: 380, y: 380 }
      ]
    };
  }

  setStrikerPosition(x, y) {
    if (this.state !== 'aiming') return { success: false };
    
    // Validate striker position (must be on baseline)
    if (y >= 360 && y <= 380 && x >= 80 && x <= 320) {
      this.striker.x = x;
      this.striker.y = y;
      return { success: true };
    }
    return { success: false, message: 'Invalid striker position' };
  }

  shootStriker(vx, vy) {
    if (this.state !== 'aiming') return { success: false };
    
    this.striker.vx = vx;
    this.striker.vy = vy;
    this.striker.isMoving = true;
    this.state = 'shooting';
    this.turnStartTime = Date.now();
    
    return { success: true };
  }

  updatePhysics() {
    if (this.state !== 'shooting') return;

    const friction = 0.98;
    const strikerRadius = 15;
    const coinRadius = 10;

    // Move striker
    this.striker.x += this.striker.vx;
    this.striker.y += this.striker.vy;

    // Apply friction
    this.striker.vx *= friction;
    this.striker.vy *= friction;

    // Wall collisions
    if (this.striker.x - strikerRadius < 0 || this.striker.x + strikerRadius > 400) {
      this.striker.vx *= -1;
      this.striker.x = Math.max(strikerRadius, Math.min(400 - strikerRadius, this.striker.x));
    }
    if (this.striker.y - strikerRadius < 0 || this.striker.y + strikerRadius > 400) {
      this.striker.vy *= -1;
      this.striker.y = Math.max(strikerRadius, Math.min(400 - strikerRadius, this.striker.y));
    }

    // Check pocket collisions
    for (const pocket of this.board.pockets) {
      const dist = Math.hypot(this.striker.x - pocket.x, this.striker.y - pocket.y);
      if (dist < 20) {
        this.striker.isMoving = false;
        this.striker.x = 200;
        this.striker.y = 400;
        this.striker.vx = 0;
        this.striker.vy = 0;
        this.nextTurn();
        return;
      }
    }

    // Check coin collisions
    for (const coin of this.board.coins) {
      if (!coin.active) continue;
      
      const dist = Math.hypot(this.striker.x - coin.x, this.striker.y - coin.y);
      if (dist < strikerRadius + coinRadius) {
        // Collision detected
        const angle = Math.atan2(coin.y - this.striker.y, coin.x - this.striker.x);
        const speed = Math.hypot(this.striker.vx, this.striker.vy);
        
        coin.x += Math.cos(angle) * speed;
        coin.y += Math.sin(angle) * speed;
        this.striker.vx *= 0.5;
        this.striker.vy *= 0.5;

        // Check if coin goes into pocket
        for (const pocket of this.board.pockets) {
          const coinDist = Math.hypot(coin.x - pocket.x, coin.y - pocket.y);
          if (coinDist < 20) {
            coin.active = false;
            this.addScore(this.players[this.currentPlayer], coin.type);
            break;
          }
        }
      }
    }

    // Stop striker if velocity is very low
    if (Math.abs(this.striker.vx) < 0.1 && Math.abs(this.striker.vy) < 0.1) {
      this.striker.isMoving = false;
      this.striker.vx = 0;
      this.striker.vy = 0;
      this.nextTurn();
    }

    // Check turn time limit
    if (Date.now() - this.turnStartTime > this.timeLimit * 1000) {
      this.nextTurn();
    }
  }

  addScore(playerId, coinType) {
    if (!this.scores[playerId]) {
      this.scores[playerId] = { white: 0, black: 0, queen: 0 };
    }

    if (coinType === 'white') this.scores[playerId].white++;
    else if (coinType === 'black') this.scores[playerId].black++;
    else if (coinType === 'queen') this.scores[playerId].queen++;

    // Check win condition (queen + 8 coins)
    const total = this.scores[playerId].white + this.scores[playerId].black;
    if (this.scores[playerId].queen >= 1 && total >= 8) {
      this.winner = playerId;
      this.state = 'finished';
    }
  }

  nextTurn() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    this.state = 'aiming';
    this.striker.x = 200;
    this.striker.y = 400;
  }

  getGameState() {
    return {
      gameId: this.gameId,
      currentPlayer: this.players[this.currentPlayer],
      state: this.state,
      board: this.board,
      striker: this.striker,
      scores: this.scores,
      winner: this.winner
    };
  }
}

module.exports = CarromGame;
