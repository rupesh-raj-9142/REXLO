const express = require('express');
const { authenticate } = require('../middleware/auth');
const CarromGame = require('../games/carromGame');
const LudoGame = require('../games/ludoGame');

const router = express.Router();

// Store active games
const activeGames = new Map();

// Simple Carrom game access
router.post('/carrom/play', authenticate, (req, res) => {
  try {
    const userId = req.user._id;
    const gameId = `carrom_${userId}_${Date.now()}`;
    
    // Create new carrom game instance
    const game = new CarromGame();
    game.resetGame();
    game.gameState.gameStarted = true;
    game.gameState.currentPlayer = 0;
    
    // Store game
    activeGames.set(gameId, {
      game,
      userId,
      type: 'carrom',
      createdAt: new Date()
    });
    
    res.json({
      success: true,
      gameId,
      gameState: game.getGameState(),
      message: 'Carrom game ready to play!'
    });
  } catch (error) {
    console.error('Carrom game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start Carrom game'
    });
  }
});

// Carrom strike endpoint
router.post('/carrom/strike/:gameId', authenticate, (req, res) => {
  try {
    const { gameId } = req.params;
    const { strikerX, strikerY, power, angle } = req.body;
    const userId = req.user._id;
    
    const gameData = activeGames.get(gameId);
    if (!gameData || gameData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Game not found or access denied'
      });
    }
    
    const moveData = {
      strikerX: strikerX || 50,
      strikerY: strikerY || 80,
      velocity: power || 50,
      angle: angle || 0,
      power: power || 50
    };
    
    const result = gameData.game.processMove(moveData, userId);
    
    res.json({
      success: true,
      gameState: result.newGameState,
      result: result.result,
      message: 'Strike completed!'
    });
  } catch (error) {
    console.error('Carrom strike error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process strike'
    });
  }
});

// Simple Ludo game access
router.post('/ludo/play', authenticate, (req, res) => {
  try {
    const userId = req.user._id;
    const gameId = `ludo_${userId}_${Date.now()}`;
    
    // Create new ludo game instance
    const game = new LudoGame();
    game.resetGame();
    game.gameState.gameStarted = true;
    game.gameState.currentPlayer = 0;
    
    // Store game
    activeGames.set(gameId, {
      game,
      userId,
      type: 'ludo',
      createdAt: new Date()
    });
    
    res.json({
      success: true,
      gameId,
      gameState: game.getGameState(),
      message: 'Ludo game ready to play!'
    });
  } catch (error) {
    console.error('Ludo game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start Ludo game'
    });
  }
});

// Ludo roll dice endpoint
router.post('/ludo/roll/:gameId', authenticate, (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;
    
    const gameData = activeGames.get(gameId);
    if (!gameData || gameData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Game not found or access denied'
      });
    }
    
    const moveData = {
      action: 'rollDice'
    };
    
    const result = gameData.game.processMove(moveData, userId);
    
    res.json({
      success: true,
      gameState: result.newGameState,
      result: result.result,
      message: 'Dice rolled!'
    });
  } catch (error) {
    console.error('Ludo roll dice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to roll dice'
    });
  }
});

// Ludo move piece endpoint
router.post('/ludo/move/:gameId', authenticate, (req, res) => {
  try {
    const { gameId } = req.params;
    const { pieceId } = req.body;
    const userId = req.user._id;
    
    const gameData = activeGames.get(gameId);
    if (!gameData || gameData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Game not found or access denied'
      });
    }
    
    const moveData = {
      action: 'movePiece',
      pieceId
    };
    
    const result = gameData.game.processMove(moveData, userId);
    
    res.json({
      success: true,
      gameState: result.newGameState,
      result: result.result,
      message: 'Piece moved!'
    });
  } catch (error) {
    console.error('Ludo move piece error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to move piece'
    });
  }
});

// Get game state
router.get('/state/:gameId', authenticate, (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;
    
    const gameData = activeGames.get(gameId);
    if (!gameData || gameData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Game not found or access denied'
      });
    }
    
    res.json({
      success: true,
      gameState: gameData.game.getGameState(),
      gameType: gameData.type
    });
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game state'
    });
  }
});

// Auto-play Carrom (AI vs AI)
router.post('/carrom/autoplay', authenticate, (req, res) => {
  try {
    const gameId = `carrom_autoplay_${Date.now()}`;
    
    const game = new CarromGame();
    game.resetGame();
    game.gameState.gameStarted = true;
    
    // Simulate AI vs AI game
    let moveCount = 0;
    const maxMoves = 20;
    
    const simulateMove = () => {
      if (moveCount >= maxMoves) {
        res.json({
          success: true,
          gameId,
          gameState: game.getGameState(),
          moves: moveCount,
          message: 'Auto-play game completed!'
        });
        return;
      }
      
      const currentPlayer = game.gameState.currentPlayer;
      const moveData = {
        strikerX: 30 + Math.random() * 40,
        strikerY: 70 + Math.random() * 20,
        velocity: 30 + Math.random() * 50,
        angle: Math.random() * Math.PI * 2,
        power: 30 + Math.random() * 50
      };
      
      // Simulate AI move
      game.processMove(moveData, `ai_player_${currentPlayer}`);
      moveCount++;
      
      // Continue simulation
      setTimeout(simulateMove, 100);
    };
    
    // Start simulation
    setTimeout(simulateMove, 100);
    
  } catch (error) {
    console.error('Carrom autoplay error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start auto-play'
    });
  }
});

// Auto-play Ludo (AI vs AI)
router.post('/ludo/autoplay', authenticate, (req, res) => {
  try {
    const gameId = `ludo_autoplay_${Date.now()}`;
    
    const game = new LudoGame();
    game.resetGame();
    game.gameState.gameStarted = true;
    
    // Simulate AI vs AI game
    let moveCount = 0;
    const maxMoves = 50;
    
    const simulateMove = () => {
      if (moveCount >= maxMoves) {
        const winner = game.checkWinner();
        res.json({
          success: true,
          gameId,
          gameState: game.getGameState(),
          moves: moveCount,
          winner,
          message: 'Auto-play game completed!'
        });
        return;
      }
      
      const currentPlayer = game.gameState.currentPlayer;
      
      // Roll dice
      const rollResult = game.processMove({ action: 'rollDice' }, `ai_player_${currentPlayer}`);
      
      if (rollResult.result && rollResult.result.validMoves && rollResult.result.validMoves.length > 0) {
        // Make a random valid move
        const randomMove = rollResult.result.validMoves[Math.floor(Math.random() * rollResult.result.validMoves.length)];
        game.processMove({
          action: 'movePiece',
          pieceId: randomMove.pieceId
        }, `ai_player_${currentPlayer}`);
      }
      
      moveCount++;
      
      // Continue simulation
      setTimeout(simulateMove, 200);
    };
    
    // Start simulation
    setTimeout(simulateMove, 100);
    
  } catch (error) {
    console.error('Ludo autoplay error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start auto-play'
    });
  }
});

// Clean up old games (cleanup endpoint)
router.post('/cleanup', authenticate, (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Clean up games older than 1 hour
    for (const [gameId, gameData] of activeGames.entries()) {
      if (gameData.userId === userId && gameData.createdAt < oneHourAgo) {
        activeGames.delete(gameId);
      }
    }
    
    res.json({
      success: true,
      message: 'Old games cleaned up'
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup games'
    });
  }
});

module.exports = router;
