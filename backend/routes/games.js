const express = require('express');
const { body, validationResult } = require('express-validator');
const Game = require('../models/Game');
const { Wallet, Transaction } = require('../models/Wallet');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get available games (lobby)
router.get('/lobby', authenticate, async (req, res) => {
  try {
    const { gameType, status = 'waiting' } = req.query;
    const filter = { status };
    
    if (gameType) {
      filter.name = gameType;
    }

    const games = await Game.find(filter)
      .populate('players.userId', 'username avatar level')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ games });
  } catch (error) {
    console.error('Get lobby error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new game
router.post('/create', authenticate, [
  body('name').isIn(['ludo', 'carrom']),
  body('maxPlayers').isInt({ min: 2, max: 4 }),
  body('entryFee').isNumeric().isFloat({ min: 0, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, maxPlayers, entryFee } = req.body;
    const userId = req.user._id;

    // Check user balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < entryFee) {
      return res.status(400).json({ message: 'Insufficient balance to create game' });
    }

    if (wallet.isFrozen) {
      return res.status(403).json({ message: 'Wallet is frozen' });
    }

    // Create game
    const game = new Game({
      name,
      maxPlayers,
      entryFee,
      prizePool: entryFee * maxPlayers
    });

    await game.save();

    // Add creator as first player
    await game.addPlayer(userId, req.user.username);

    // Deduct entry fee
    await wallet.addTransaction({
      type: 'game_entry',
      amount: entryFee,
      description: `Entry fee for ${name} game`,
      status: 'completed',
      gameId: game._id
    });

    await wallet.updateBalance(entryFee, 'game_entry');
    wallet.totalSpent += entryFee;
    await wallet.save();

    // Update user stats
    req.user.gamesPlayed += 1;
    await req.user.save();

    res.status(201).json({
      message: 'Game created successfully',
      game: await Game.findById(game._id).populate('players.userId', 'username avatar level')
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join game
router.post('/join/:gameId', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ message: 'Game is not accepting players' });
    }

    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ message: 'Game is full' });
    }

    // Check if user already in game
    const existingPlayer = game.players.find(p => p.userId.toString() === userId.toString());
    if (existingPlayer) {
      return res.status(400).json({ message: 'Already in this game' });
    }

    // Check user balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < game.entryFee) {
      return res.status(400).json({ message: 'Insufficient balance to join game' });
    }

    if (wallet.isFrozen) {
      return res.status(403).json({ message: 'Wallet is frozen' });
    }

    // Add player to game
    await game.addPlayer(userId, req.user.username);

    // Deduct entry fee
    await wallet.addTransaction({
      type: 'game_entry',
      amount: game.entryFee,
      description: `Entry fee for ${game.name} game`,
      status: 'completed',
      gameId: game._id
    });

    await wallet.updateBalance(game.entryFee, 'game_entry');
    wallet.totalSpent += game.entryFee;
    await wallet.save();

    // Update user stats
    req.user.gamesPlayed += 1;
    await req.user.save();

    // Calculate and update prize pool
    game.calculatePrizePool();
    await game.save();

    res.json({
      message: 'Joined game successfully',
      game: await Game.findById(gameId).populate('players.userId', 'username avatar level')
    });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave game
router.post('/leave/:gameId', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Remove player from game
    await game.removePlayer(userId);

    // Refund entry fee if game hasn't started
    if (game.status === 'waiting') {
      const wallet = await Wallet.findOne({ userId });
      
      await wallet.addTransaction({
        type: 'refund',
        amount: game.entryFee,
        description: `Refund for leaving ${game.name} game`,
        status: 'completed',
        gameId: game._id
      });

      await wallet.updateBalance(game.entryFee, 'refund');
      await wallet.save();
    }

    res.json({ message: 'Left game successfully' });
  } catch (error) {
    console.error('Leave game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get game details
router.get('/:gameId', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const game = await Game.findById(gameId)
      .populate('players.userId', 'username avatar level gamesWon gamesPlayed')
      .populate('winner', 'username avatar');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({ game });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's game history
router.get('/history/my', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { 'players.userId': req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const games = await Game.find(filter)
      .populate('players.userId', 'username avatar')
      .populate('winner', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Game.countDocuments(filter);

    res.json({
      games,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard/global', async (req, res) => {
  try {
    const { limit = 50, gameType } = req.query;
    
    const User = require('../models/User');
    let filter = { isBlocked: false };
    
    if (gameType) {
      // For specific game types, we'd need to track game-specific stats
      // For now, showing overall leaderboard
    }

    const leaderboard = await User.find(filter)
      .select('username avatar level gamesPlayed gamesWon totalWinnings experience')
      .sort({ totalWinnings: -1, level: -1, experience: -1 })
      .limit(parseInt(limit));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
