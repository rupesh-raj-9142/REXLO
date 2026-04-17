const express = require('express');
const { body, validationResult } = require('express-validator');
const GameController = require('../controllers/gameController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Middleware to validate game requests
const validateGameRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next();
  }
  res.status(400).json({ 
    success: false, 
    errors: errors.array() 
  });
};

// Initialize game
router.post('/initialize', [
  authenticate,
  body('gameId').isUUID().withMessage('Invalid game ID'),
  body('gameType').isIn(['ludo', 'carrom']).withMessage('Invalid game type'),
  body('players').isArray().withMessage('Players must be an array'),
  body('settings').optional().isObject().withMessage('Settings must be an object')
], validateGameRequest, (req, res) => {
  try {
    const { gameId, gameType, players, settings } = req.body;
    
    // Initialize game state
    const gameState = GameController.initializeGameState(gameId, gameType, players, settings);
    
    res.json({
      success: true,
      data: {
        gameState,
        message: 'Game initialized successfully'
      }
    });
  } catch (error) {
    console.error('Game initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize game'
    });
  }
});

// Get game state
router.get('/state/:gameId', authenticate, (req, res) => {
  try {
    const { gameId } = req.params;
    const gameState = GameController.getGameState(gameId);
    
    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: gameState
    });
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game state'
    });
  }
});

// Ludo game actions
router.post('/ludo/roll-dice', [
  authenticate,
  body('gameId').isUUID().withMessage('Invalid game ID'),
  body('playerId').isMongoId().withMessage('Invalid player ID')
], validateGameRequest, (req, res) => {
  try {
    const { gameId, playerId } = req.body;
    const result = GameController.rollDice(gameId, playerId);
    
    res.json(result);
  } catch (error) {
    console.error('Roll dice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to roll dice'
    });
  }
});

router.post('/ludo/move-piece', [
  authenticate,
  body('gameId').isUUID().withMessage('Invalid game ID'),
  body('playerId').isMongoId().withMessage('Invalid player ID'),
  body('pieceId').isInt({ min: 0, max: 3 }).withMessage('Invalid piece ID'),
  body('newPosition').isInt({ min: 0, max: 51 }).withMessage('Invalid position')
], validateGameRequest, (req, res) => {
  try {
    const { gameId, playerId, pieceId, newPosition } = req.body;
    const result = GameController.moveLudoPiece(gameId, playerId, pieceId, newPosition);
    
    res.json(result);
  } catch (error) {
    console.error('Move piece error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to move piece'
    });
  }
});

// Carrom game actions
router.post('/carrom/strike', [
  authenticate,
  body('gameId').isUUID().withMessage('Invalid game ID'),
  body('playerId').isMongoId().withMessage('Invalid player ID'),
  body('strikerPosition').isObject().withMessage('Invalid striker position'),
  body('force').isFloat({ min: 0, max: 100 }).withMessage('Invalid force')
], validateGameRequest, (req, res) => {
  try {
    const { gameId, playerId, strikerPosition, force } = req.body;
    const result = GameController.strikeCarrom(gameId, playerId, strikerPosition, force);
    
    res.json(result);
  } catch (error) {
    console.error('Carrom strike error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to strike'
    });
  }
});

// Player actions
router.post('/player/ready', [
  authenticate,
  body('gameId').isUUID().withMessage('Invalid game ID'),
  body('playerId').isMongoId().withMessage('Invalid player ID'),
  body('isReady').isBoolean().withMessage('Invalid ready status')
], validateGameRequest, (req, res) => {
  try {
    const { gameId, playerId, isReady } = req.body;
    const result = GameController.setPlayerReady(gameId, playerId, isReady);
    
    res.json(result);
  } catch (error) {
    console.error('Set player ready error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set player ready status'
    });
  }
});

// Game statistics
router.get('/stats/:gameId', authenticate, (req, res) => {
  try {
    const { gameId } = req.params;
    const result = GameController.getGameStats(gameId);
    
    res.json(result);
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game statistics'
    });
  }
});

// Game cleanup
router.delete('/cleanup/:gameId', [
  authenticate,
  body('gameId').isUUID().withMessage('Invalid game ID')
], validateGameRequest, (req, res) => {
  try {
    const { gameId } = req.params;
    GameController.cleanupGameState(gameId);
    
    res.json({
      success: true,
      message: 'Game state cleaned up successfully'
    });
  } catch (error) {
    console.error('Game cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup game state'
    });
  }
});

// Game analytics
router.get('/analytics', authenticate, (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    // Mock analytics data
    const analytics = {
      activeGames: 23,
      totalPlayers: 156,
      averageGameDuration: 8.5, // minutes
      popularGames: [
        { name: 'Ludo', players: 145, games: 89 },
        { name: 'Carrom', players: 98, games: 67 }
      ],
      revenue: {
        total: 15420,
        today: 1250,
        growth: 15.2 // percentage
      },
      performance: {
        serverUptime: '99.9%',
        averageResponseTime: 45, // ms
        errorRate: '0.02%'
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Game analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game analytics'
    });
  }
});

// Matchmaking
router.post('/matchmaking', [
  authenticate,
  body('gameType').isIn(['ludo', 'carrom']).withMessage('Invalid game type'),
  body('skillLevel').optional().isInt({ min: 1, max: 10 }).withMessage('Invalid skill level'),
  body('entryFee').optional().isFloat({ min: 0, max: 1000 }).withMessage('Invalid entry fee')
], validateGameRequest, async (req, res) => {
  try {
    const { gameType, skillLevel, entryFee } = req.body;
    const userId = req.user._id;
    
    // Find matching players
    const matchingPlayers = await findMatchingPlayers(gameType, skillLevel, entryFee, userId);
    
    if (matchingPlayers.length >= 3) {
      // Create game instance
      const gameId = require('uuid').v4();
      const players = matchingPlayers.slice(0, 4); // Max 4 players
      
      // Initialize game
      const gameState = GameController.initializeGameState(gameId, gameType, players);
      
      res.json({
        success: true,
        data: {
          gameId,
          gameState,
          players: players.length,
          message: 'Match found and game created'
        }
      });
    } else {
      // Add to matchmaking queue
      await addToMatchmakingQueue(userId, gameType, skillLevel, entryFee);
      
      res.json({
        success: true,
        data: {
          queued: true,
          queuePosition: await getQueuePosition(userId, gameType),
          estimatedWaitTime: await calculateWaitTime(gameType, skillLevel),
          message: 'Added to matchmaking queue'
        }
      });
    }
  } catch (error) {
    console.error('Matchmaking error:', error);
    res.status(500).json({
      success: false,
      error: 'Matchmaking failed'
    });
  }
});

// Helper functions for matchmaking
async function findMatchingPlayers(gameType, skillLevel, entryFee, excludeUserId) {
  // Mock implementation - in real app, query database
  return [];
}

async function addToMatchmakingQueue(userId, gameType, skillLevel, entryFee) {
  // Mock implementation - in real app, add to database queue
  console.log(`Added user ${userId} to ${gameType} queue`);
}

async function getQueuePosition(userId, gameType) {
  // Mock implementation
  return 1;
}

async function calculateWaitTime(gameType, skillLevel) {
  // Mock implementation - calculate based on queue length and skill level
  return 120; // seconds
}

module.exports = router;
