class CarromGame {
  constructor() {
    this.boardSize = 100; // Percentage-based positioning
    this.coinRadius = 2.5;
    this.strikerRadius = 3;
    this.pocketRadius = 5;
    
    // Pocket positions (percentage of board)
    this.pockets = [
      { x: 0, y: 0 },           // Top-left
      { x: 50, y: 0 },          // Top-center
      { x: 100, y: 0 },         // Top-right
      { x: 0, y: 100 },         // Bottom-left
      { x: 50, y: 100 },        // Bottom-center
      { x: 100, y: 100 }        // Bottom-right
    ];
    
    this.resetGame();
  }

  resetGame() {
    this.gameState = {
      type: 'carrom',
      currentPlayer: 0,
      players: [],
      coins: {
        black: [],
        white: [],
        red: null
      },
      striker: { x: 50, y: 80 },
      gameStarted: false,
      turnCount: 0,
      scores: [0, 0],
      fouls: [0, 0],
      lastMove: null
    };
    
    this.initializeCoins();
  }

  initializeCoins() {
    // Initialize black coins
    for (let i = 0; i < 9; i++) {
      this.gameState.coins.black.push({
        id: `black_${i}`,
        x: 45 + (i % 3) * 5,
        y: 45 + Math.floor(i / 3) * 5,
        active: true,
        velocity: { x: 0, y: 0 }
      });
    }

    // Initialize white coins
    for (let i = 0; i < 9; i++) {
      this.gameState.coins.white.push({
        id: `white_${i}`,
        x: 52 + (i % 3) * 5,
        y: 45 + Math.floor(i / 3) * 5,
        active: true,
        velocity: { x: 0, y: 0 }
      });
    }

    // Initialize red coin (queen)
    this.gameState.coins.red = {
      id: 'red_queen',
      x: 50,
      y: 50,
      active: true,
      velocity: { x: 0, y: 0 },
      isQueen: true
    };
  }

  initializePlayers(playerCount) {
    this.gameState.players = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      userId: null,
      username: `Player ${i + 1}`,
      coins: [],
      hasCoveredQueen: false,
      strikerPosition: { x: 50, y: 80 }
    }));
  }

  processMove(moveData, userId) {
    const { strikerX, strikerY, velocity, angle, power } = moveData;
    
    // Validate move
    if (!this.validateMove(moveData)) {
      return { success: false, error: 'Invalid move' };
    }

    // Find player index
    const playerIndex = this.getPlayerIndex(userId);
    if (playerIndex !== this.gameState.currentPlayer) {
      return { success: false, error: 'Not your turn' };
    }

    const player = this.gameState.players[playerIndex];
    
    // Update striker position and velocity
    player.striker = { x: strikerX, y: strikerY };
    this.gameState.striker = { 
      x: strikerX, 
      y: strikerY,
      velocity: {
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power
      }
    };

    // Simulate physics
    const result = this.simulatePhysics();
    
    // Update scores based on pocketed coins
    this.updateScores(result.pocketedCoins, playerIndex);
    
    // Check for fouls
    const foul = this.checkFoul(result);
    if (foul) {
      this.gameState.fouls[playerIndex]++;
      result.foul = foul;
    }

    // Check for winner
    const winner = this.checkWinner();
    
    // Switch turns (unless player scored or committed foul)
    if (result.pocketedCoins.length === 0 && !foul) {
      this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
    }

    this.gameState.turnCount++;
    this.gameState.lastMove = {
      player: playerIndex,
      moveData,
      result,
      timestamp: new Date()
    };

    return {
      success: true,
      newGameState: this.gameState,
      result,
      winner
    };
  }

  validateMove(moveData) {
    const { strikerX, strikerY, velocity, angle, power } = moveData;
    
    // Check if striker is within valid bounds
    if (strikerX < 10 || strikerX > 90 || strikerY < 70 || strikerY > 90) {
      return false;
    }

    // Check if power is within valid range
    if (power < 1 || power > 100) {
      return false;
    }

    // Check if angle is valid
    if (angle < 0 || angle > 2 * Math.PI) {
      return false;
    }

    return true;
  }

  simulatePhysics() {
    const result = {
      pocketedCoins: [],
      collisions: [],
      finalPositions: {}
    };

    // Simulate striker movement
    const striker = this.gameState.striker;
    let steps = 100; // Simulation steps
    const friction = 0.98;
    const minVelocity = 0.1;

    while (steps-- > 0 && 
           (Math.abs(striker.velocity.x) > minVelocity || 
            Math.abs(striker.velocity.y) > minVelocity)) {
      
      // Update striker position
      striker.x += striker.velocity.x * 0.1;
      striker.y += striker.velocity.y * 0.1;

      // Apply friction
      striker.velocity.x *= friction;
      striker.velocity.y *= friction;

      // Check wall collisions
      if (striker.x <= this.strikerRadius || striker.x >= 100 - this.strikerRadius) {
        striker.velocity.x = -striker.velocity.x * 0.8;
        striker.x = Math.max(this.strikerRadius, Math.min(100 - this.strikerRadius, striker.x));
      }

      if (striker.y <= this.strikerRadius || striker.y >= 100 - this.strikerRadius) {
        striker.velocity.y = -striker.velocity.y * 0.8;
        striker.y = Math.max(this.strikerRadius, Math.min(100 - this.strikerRadius, striker.y));
      }

      // Check coin collisions
      this.checkCoinCollisions(striker, result);

      // Check if striker falls into pocket
      const pocketed = this.checkPocketCollision(striker);
      if (pocketed) {
        result.pocketedCoins.push({ type: 'striker', pocket: pocketed });
        striker.x = 50; // Reset striker position
        striker.y = 80;
        striker.velocity = { x: 0, y: 0 };
        break;
      }
    }

    // Stop striker
    striker.velocity = { x: 0, y: 0 };

    return result;
  }

  checkCoinCollisions(striker, result) {
    const allCoins = [
      ...this.gameState.coins.black.filter(c => c.active),
      ...this.gameState.coins.white.filter(c => c.active),
      this.gameState.coins.red
    ].filter(Boolean);

    allCoins.forEach(coin => {
      const distance = Math.sqrt(
        Math.pow(striker.x - coin.x, 2) + 
        Math.pow(striker.y - coin.y, 2)
      );

      if (distance < this.strikerRadius + this.coinRadius) {
        // Collision detected
        const angle = Math.atan2(coin.y - striker.y, coin.x - striker.x);
        const force = Math.sqrt(
          Math.pow(striker.velocity.x, 2) + 
          Math.pow(striker.velocity.y, 2)
        );

        // Transfer momentum to coin
        coin.velocity = {
          x: Math.cos(angle) * force * 0.8,
          y: Math.sin(angle) * force * 0.8
        };

        // Reduce striker velocity
        striker.velocity.x *= 0.5;
        striker.velocity.y *= 0.5;

        result.collisions.push({
          striker: { x: striker.x, y: striker.y },
          coin: { id: coin.id, x: coin.x, y: coin.y }
        });

        // Simulate coin movement
        this.simulateCoinMovement(coin, result);
      }
    });
  }

  simulateCoinMovement(coin, result) {
    const friction = 0.95;
    const minVelocity = 0.1;
    let steps = 50;

    while (steps-- > 0 && 
           (Math.abs(coin.velocity.x) > minVelocity || 
            Math.abs(coin.velocity.y) > minVelocity)) {
      
      coin.x += coin.velocity.x * 0.1;
      coin.y += coin.velocity.y * 0.1;

      coin.velocity.x *= friction;
      coin.velocity.y *= friction;

      // Wall collisions
      if (coin.x <= this.coinRadius || coin.x >= 100 - this.coinRadius) {
        coin.velocity.x = -coin.velocity.x * 0.8;
        coin.x = Math.max(this.coinRadius, Math.min(100 - this.coinRadius, coin.x));
      }

      if (coin.y <= this.coinRadius || coin.y >= 100 - this.coinRadius) {
        coin.velocity.y = -coin.velocity.y * 0.8;
        coin.y = Math.max(this.coinRadius, Math.min(100 - this.coinRadius, coin.y));
      }

      // Check pocket collision
      const pocket = this.checkPocketCollision(coin);
      if (pocket) {
        coin.active = false;
        result.pocketedCoins.push({ 
          type: coin.isQueen ? 'queen' : 'coin', 
          coinId: coin.id,
          color: coin.isQueen ? 'red' : (coin.id.startsWith('black') ? 'black' : 'white'),
          pocket 
        });
        break;
      }
    }

    coin.velocity = { x: 0, y: 0 };
  }

  checkPocketCollision(object) {
    for (let i = 0; i < this.pockets.length; i++) {
      const pocket = this.pockets[i];
      const distance = Math.sqrt(
        Math.pow(object.x - pocket.x, 2) + 
        Math.pow(object.y - pocket.y, 2)
      );

      if (distance < this.pocketRadius) {
        return i;
      }
    }
    return null;
  }

  updateScores(pocketedCoins, playerIndex) {
    const player = this.gameState.players[playerIndex];
    
    pocketedCoins.forEach(pocketed => {
      if (pocketed.type === 'coin') {
        // Regular coin: 1 point
        this.gameState.scores[playerIndex] += 1;
        player.coins.push(pocketed.coinId);
      } else if (pocketed.type === 'queen') {
        // Queen: 3 points, but needs to be covered
        this.gameState.scores[playerIndex] += 3;
        player.hasCoveredQueen = true;
        player.coins.push(pocketed.coinId);
      } else if (pocketed.type === 'striker') {
        // Striker in pocket: foul
        this.gameState.scores[playerIndex] = Math.max(0, this.gameState.scores[playerIndex] - 1);
      }
    });
  }

  checkFoul(result) {
    // Foul conditions
    if (result.pocketedCoins.some(c => c.type === 'striker')) {
      return 'striker_pocketed';
    }

    // Check if striker didn't touch any coin
    if (result.collisions.length === 0 && result.pocketedCoins.length === 0) {
      return 'no_contact';
    }

    return null;
  }

  checkWinner() {
    // Check if all coins are pocketed
    const activeBlackCoins = this.gameState.coins.black.filter(c => c.active).length;
    const activeWhiteCoins = this.gameState.coins.white.filter(c => c.active).length;
    const redQueenActive = this.gameState.coins.red && this.gameState.coins.red.active;

    if (activeBlackCoins === 0 && activeWhiteCoins === 0 && !redQueenActive) {
      // Game over - find winner
      const maxScore = Math.max(...this.gameState.scores);
      const winnerIndex = this.gameState.scores.indexOf(maxScore);
      
      return {
        playerIndex: winnerIndex,
        scores: this.gameState.scores,
        reason: 'all_coins_pocketed'
      };
    }

    return null;
  }

  getPlayerIndex(userId) {
    // This should be properly implemented based on user-game mapping
    // For now, returning current player as placeholder
    return this.gameState.currentPlayer;
  }

  getGameState() {
    return {
      ...this.gameState,
      boardSize: this.boardSize,
      pocketPositions: this.pockets
    };
  }
}

module.exports = CarromGame;
