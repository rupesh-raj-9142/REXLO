const Game = require('../models/Game');
const User = require('../models/User');
const { Wallet, Transaction } = require('../models/Wallet');
const CarromGame = require('../games/carromGame');
const LudoGame = require('../games/ludoGame');

// Game state management
const gameStates = new Map();
const gameInstances = new Map(); // Store game class instances

class GameController {
  // Initialize game state
  static initializeGameState(gameId, gameType, players) {
    // Create game instance
    const gameInstance = gameType === 'carrom' ? new CarromGame() : new LudoGame();
    gameInstance.initializePlayers(players.length);
    
    // Map users to player indices
    players.forEach((player, index) => {
      gameInstance.gameState.players[index].userId = player.userId;
      gameInstance.gameState.players[index].username = player.username;
    });
    
    const gameState = gameInstance.getGameState();
    gameState.gameId = gameId;
    gameState.status = 'waiting';
    gameState.settings = {
      autoStart: true,
      allowSpectators: true,
      entryFee: 0,
      maxPlayers: 4
    };
    
    // Store both state and instance
    gameStates.set(gameId, gameState);
    gameInstances.set(gameId, gameInstance);
    
    return gameState;
  }

  // Ludo game initialization
  static initializeLudoPieces() {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      position: -1, // -1 means in base
      isHome: false,
      canMove: false
    }));
  }

  static initializeLudoBoard() {
    return Array(52).fill(null); // 52 positions on Ludo board
  }

  // Carrom game initialization
  static initializeCarromPieces() {
    return {
      striker: { x: 50, y: 80 },
      coins: []
    };
  }

  static initializeCarromBoard() {
    return {
      coins: {
        black: Array.from({ length: 9 }, (_, i) => ({
          id: `black_${i}`,
          x: 20 + (i % 3) * 30,
          y: 20 + Math.floor(i / 3) * 30,
          active: true,
          color: 'black'
        })),
        white: Array.from({ length: 9 }, (_, i) => ({
          id: `white_${i}`,
          x: 20 + (i % 3) * 30,
          y: 20 + Math.floor(i / 3) * 30,
          active: true,
          color: 'white'
        })),
        red: {
          id: 'red_queen',
          x: 50,
          y: 50,
          active: true,
          color: 'red'
        }
      }
    };
  }

  // Get game state
  static getGameState(gameId) {
    return gameStates.get(gameId);
  }

  // Update game state
  static updateGameState(gameId, updates) {
    const gameState = gameStates.get(gameId);
    if (gameState) {
      Object.assign(gameState, updates);
      gameStates.set(gameId, gameState);
    }
    return gameState;
  }

  // Ludo game logic
  static rollDice(gameId, playerId) {
    const gameInstance = gameInstances.get(gameId);
    if (!gameInstance) {
      return { success: false, error: 'Game not found' };
    }

    const moveData = {
      action: 'rollDice',
      playerId
    };

    const result = gameInstance.processMove(moveData, playerId);
    
    if (result.success) {
      // Update stored game state
      gameStates.set(gameId, result.newGameState);
    }
    
    return result;
  }

  static checkLudoMoves(gameState, player, dice) {
    const moves = [];
    
    player.pieces.forEach((piece, pieceIndex) => {
      if (piece.position === -1 && dice === 6) {
        // Can move piece out of base
        moves.push({
          pieceId: pieceIndex,
          from: -1,
          to: player.index * 13, // Starting position for each player
          type: 'exit_base'
        });
      } else if (piece.position >= 0) {
        // Can move piece on board
        const newPosition = (piece.position + dice) % 52;
        if (!this.isPositionOccupied(gameState, newPosition, player.index)) {
          moves.push({
            pieceId: pieceIndex,
            from: piece.position,
            to: newPosition,
            type: 'move'
          });
        }
      }
    });

    return moves;
  }

  static isPositionOccupied(gameState, position, playerIndex) {
    // Check if position is occupied by opponent's piece
    return gameState.players.some(player => 
      player.index !== playerIndex &&
      player.pieces.some(piece => piece.position === position)
    );
  }

  // Move Ludo piece
  static moveLudoPiece(gameId, playerId, pieceId, newPosition) {
    const gameInstance = gameInstances.get(gameId);
    if (!gameInstance) {
      return { success: false, error: 'Game not found' };
    }

    const moveData = {
      action: 'movePiece',
      pieceId,
      diceValue: gameState.dice // Use current dice value
    };

    const result = gameInstance.processMove(moveData, playerId);
    
    if (result.success) {
      // Update stored game state
      gameStates.set(gameId, result.newGameState);
    }
    
    return result;
  }

  // Carrom game logic
  static strikeCarrom(gameId, playerId, strikerPosition, force) {
    const gameInstance = gameInstances.get(gameId);
    if (!gameInstance) {
      return { success: false, error: 'Game not found' };
    }

    const moveData = {
      strikerX: strikerPosition.x,
      strikerY: strikerPosition.y,
      velocity: force,
      angle: 0, // Can be calculated based on target position
      power: force
    };

    const result = gameInstance.processMove(moveData, playerId);
    
    if (result.success) {
      // Update stored game state
      gameStates.set(gameId, result.newGameState);
    }
    
    return result;
  }

  static calculateCarromHits(gameState, strikerPosition, force) {
    const hits = [];
    const { coins } = gameState.board;
    
    // Simple collision detection
    Object.keys(coins).forEach(color => {
      coins[color].forEach(coin => {
        if (!coin.active) return;
        
        const distance = Math.sqrt(
          Math.pow(coin.x - strikerPosition.x, 2) + 
          Math.pow(coin.y - strikerPosition.y, 2)
        );
        
        if (distance < 20) { // Hit radius
          hits.push({
            coinId: coin.id,
            color: coin.color,
            position: { x: coin.x, y: coin.y }
          });
        }
      });
    });

    return hits;
  }

  static getActiveCoins(gameState) {
    const activeCoins = [];
    const { coins } = gameState.board;
    
    Object.keys(coins).forEach(color => {
      coins[color].forEach(coin => {
        if (coin.active) {
          activeCoins.push(coin);
        }
      });
    });

    return activeCoins;
  }

  static checkCarromWinner(gameState) {
    // Simple win condition: player with most points when all coins are pocketed
    const scores = gameState.players.map(player => player.score);
    const maxScore = Math.max(...scores);
    const winner = gameState.players.find(player => player.score === maxScore);
    
    return winner && this.getActiveCoins(gameState).length === 0;
  }

  // Player ready status
  static setPlayerReady(gameId, playerId, isReady) {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return { success: false, error: 'Game not found' };
    }

    const player = gameState.players.find(p => p.id.toString() === playerId.toString());
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.isReady = isReady;

    // Check if all players are ready
    const allReady = gameState.players.every(p => p.isReady);
    if (allReady && gameState.status === 'waiting') {
      gameState.status = 'playing';
      gameState.startTime = new Date();
      gameState.currentPlayer = 0;
    }

    return {
      success: true,
      data: {
        gameState: gameState,
        allReady,
        gameStarted: gameState.status === 'playing'
      }
    };
  }

  // Get game statistics
  static getGameStats(gameId) {
    const gameState = gameStates.get(gameId);
    if (!gameState) {
      return { success: false, error: 'Game not found' };
    }

    const duration = gameState.endTime ? 
      gameState.endTime - gameState.startTime : 
      new Date() - gameState.startTime;

    return {
      success: true,
      data: {
        gameId,
        gameType: gameState.gameType,
        status: gameState.status,
        players: gameState.players.length,
        duration: Math.floor(duration / 1000), // in seconds
        moves: gameState.moves.length,
        currentPlayer: gameState.currentPlayer,
        winner: gameState.winner,
        startTime: gameState.startTime,
        endTime: gameState.endTime
      }
    };
  }

  // Clean up game state
  static cleanupGameState(gameId) {
    gameStates.delete(gameId);
  }
}

module.exports = GameController;
