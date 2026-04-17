const express = require('express');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const { Wallet, Transaction } = require('../models/Wallet');
const CarromGame = require('../games/carromGame');
const LudoGame = require('../games/ludoGame');

const router = express.Router();

// Store active instant games
const instantGames = new Map();
const MIN_ENTRY_FEE = 10;
const MAX_ENTRY_FEE = 1000;
const GAME_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Start instant game with entry fee
router.post('/start', authenticate, async (req, res) => {
  try {
    const { gameType, entryFee } = req.body;
    const userId = req.user._id;

    // Validate entry fee
    if (entryFee < MIN_ENTRY_FEE || entryFee > MAX_ENTRY_FEE) {
      return res.status(400).json({
        success: false,
        error: `Entry fee must be between $${MIN_ENTRY_FEE} and $${MAX_ENTRY_FEE}`
      });
    }

    // Check user balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < entryFee) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Create unique game ID
    const gameId = `instant_${gameType}_${userId}_${Date.now()}`;
    
    // Create game instance
    const game = gameType === 'carrom' ? new CarromGame() : new LudoGame();
    game.resetGame();
    game.gameState.gameStarted = true;
    game.gameState.entryFee = entryFee;
    game.gameState.prizePool = entryFee * 2; // 2x multiplier for instant games
    game.gameState.startTime = new Date();
    game.gameState.endTime = new Date(Date.now() + GAME_DURATION);

    // Deduct entry fee
    await wallet.addTransaction({
      type: 'game_entry',
      amount: entryFee,
      description: `Entry fee for instant ${gameType} game`,
      status: 'completed',
      gameId
    });

    await wallet.updateBalance(entryFee, 'game_entry');
    wallet.totalSpent += entryFee;
    await wallet.save();

    // Store game
    instantGames.set(gameId, {
      game,
      userId,
      gameType,
      entryFee,
      prizePool: entryFee * 2,
      startTime: new Date(),
      endTime: new Date(Date.now() + GAME_DURATION),
      status: 'playing'
    });

    res.json({
      success: true,
      gameId,
      gameState: game.getGameState(),
      entryFee,
      prizePool: entryFee * 2,
      timeRemaining: GAME_DURATION,
      message: `${gameType} game started! Win within 1 hour to earn $${entryFee * 2}!`
    });

  } catch (error) {
    console.error('Start instant game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start game'
    });
  }
});

// Make a move in instant game
router.post('/move/:gameId', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { moveData } = req.body;
    const userId = req.user._id;

    const gameData = instantGames.get(gameId);
    if (!gameData || gameData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Game not found or access denied'
      });
    }

    // Check if game is still active
    if (new Date() > gameData.endTime) {
      instantGames.delete(gameId);
      return res.status(400).json({
        success: false,
        error: 'Game time expired'
      });
    }

    // Process move
    const result = gameData.game.processMove(moveData, userId);
    
    // Check for winner
    if (result.winner) {
      await handleInstantWin(gameId, userId, gameData);
    }

    res.json({
      success: true,
      gameState: result.newGameState,
      result: result.result,
      timeRemaining: Math.max(0, gameData.endTime - new Date()),
      winner: result.winner
    });

  } catch (error) {
    console.error('Instant game move error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process move'
    });
  }
});

// Check game status
router.get('/status/:gameId', authenticate, (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;

    const gameData = instantGames.get(gameId);
    if (!gameData || gameData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Game not found or access denied'
      });
    }

    const timeRemaining = Math.max(0, gameData.endTime - new Date());
    const isExpired = timeRemaining === 0;

    if (isExpired) {
      instantGames.delete(gameId);
    }

    res.json({
      success: true,
      gameState: gameData.game.getGameState(),
      timeRemaining,
      isExpired,
      entryFee: gameData.entryFee,
      prizePool: gameData.prizePool
    });

  } catch (error) {
    console.error('Game status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game status'
    });
  }
});

// Handle instant win
const handleInstantWin = async (gameId, userId, gameData) => {
  try {
    // Calculate winnings (2x entry fee)
    const winnings = gameData.prizePool;
    
    // Add winnings to wallet instantly
    const wallet = await Wallet.findOne({ userId });
    if (wallet) {
      await wallet.addTransaction({
        type: 'instant_win',
        amount: winnings,
        description: `Instant ${gameData.gameType} game win!`,
        status: 'completed',
        gameId
      });

      await wallet.updateBalance(winnings, 'instant_win');
      wallet.totalWinnings += winnings;
      await wallet.save();
    }

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { gamesWon: 1, totalWinnings: winnings }
    });

    // Clean up game
    instantGames.delete(gameId);

    console.log(`Instant win: User ${userId} won $${winnings} in ${gameData.gameType}`);

  } catch (error) {
    console.error('Handle instant win error:', error);
  }
};

// Get available instant games
router.get('/available', authenticate, (req, res) => {
  try {
    const userId = req.user._id;
    const userGames = [];

    for (const [gameId, gameData] of instantGames.entries()) {
      if (gameData.userId === userId) {
        userGames.push({
          gameId,
          gameType: gameData.gameType,
          entryFee: gameData.entryFee,
          prizePool: gameData.prizePool,
          startTime: gameData.startTime,
          endTime: gameData.endTime,
          timeRemaining: Math.max(0, gameData.endTime - new Date()),
          status: gameData.status
        });
      }
    }

    res.json({
      success: true,
      games: userGames,
      totalActive: userGames.length
    });

  } catch (error) {
    console.error('Get available games error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available games'
    });
  }
});

// Clean up expired games
router.post('/cleanup', authenticate, async (req, res) => {
  try {
    const now = new Date();
    let cleanedCount = 0;

    for (const [gameId, gameData] of instantGames.entries()) {
      if (now > gameData.endTime) {
        instantGames.delete(gameId);
        cleanedCount++;
      }
    }

    res.json({
      success: true,
      cleanedCount,
      message: `Cleaned up ${cleanedCount} expired games`
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
