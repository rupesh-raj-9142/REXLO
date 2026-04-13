const Match = require('../models/Match');
const Game = require('../models/Game');
const User = require('../models/User');
const { processTransaction } = require('./walletController');

// Create a new match
const createMatch = async (req, res) => {
  try {
    const { gameId, entryFee, userId } = req.body;

    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const feeConfig = game.entryFees.find(f => f.amount === entryFee);
    if (!feeConfig) {
      return res.status(400).json({ success: false, message: 'Invalid entry fee' });
    }

    // Calculate platform fee (typically 10-15%)
    const platformFee = Math.round(entryFee * 0.1);
    const prizePool = (entryFee * 2) - platformFee;

    const match = new Match({
      gameId,
      gameName: game.name,
      entryFee,
      prizePool,
      platformFee,
      status: 'pending',
      players: [{ userId }]
    });

    await match.save();

    res.json({
      success: true,
      match,
      message: 'Match created, waiting for opponent'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join a match
const joinMatch = async (req, res) => {
  try {
    const { matchId, userId } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Match is not available' });
    }

    if (match.players.length >= 2) {
      return res.status(400).json({ success: false, message: 'Match is full' });
    }

    // Check if user already joined
    if (match.players.some(p => p.userId.toString() === userId)) {
      return res.status(400).json({ success: false, message: 'Already in this match' });
    }

    match.players.push({ userId });

    // If match is full, start it
    if (match.players.length === 2) {
      match.status = 'active';
      match.startedAt = new Date();
    }

    await match.save();

    res.json({
      success: true,
      match,
      message: match.status === 'active' ? 'Match started!' : 'Joined match successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete match and distribute winnings
const completeMatch = async (req, res) => {
  const session = await require('mongoose').startSession();
  session.startTransaction();

  try {
    const { matchId, winnerId, loserId, gameData } = req.body;

    const match = await Match.findById(matchId).session(session);
    if (!match) {
      throw new Error('Match not found');
    }

    if (match.status !== 'active') {
      throw new Error('Match is not active');
    }

    // Update match status
    match.status = 'completed';
    match.winnerId = winnerId;
    match.loserId = loserId;
    match.gameData = gameData;
    match.completedAt = new Date();

    await match.save({ session });

    // Add winnings to winner's wallet
    await processTransaction(
      winnerId,
      'winnings',
      match.prizePool,
      `Winnings from match ${match._id}`,
      { matchId: match._id },
      session
    );

    // Update user stats
    const winner = await User.findById(winnerId).session(session);
    const loser = await User.findById(loserId).session(session);

    winner.totalGamesPlayed += 1;
    loser.totalGamesPlayed += 1;

    await winner.save({ session });
    await loser.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Match completed, winnings distributed',
      match
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel match and refund
const cancelMatch = async (req, res) => {
  try {
    const { matchId, reason } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (match.status !== 'pending' && match.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this match' });
    }

    match.status = 'cancelled';
    await match.save();

    // Refund entry fees to all players
    for (const player of match.players) {
      await processTransaction(
        player.userId,
        'refund',
        match.entryFee,
        reason || 'Match cancelled',
        { matchId: match._id }
      );
    }

    res.json({
      success: true,
      message: 'Match cancelled and refunds processed'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available matches
const getAvailableMatches = async (req, res) => {
  try {
    const { gameId } = req.query;

    const filter = { status: 'pending' };
    if (gameId) filter.gameId = gameId;

    const matches = await Match.find(filter)
      .populate('players.userId', 'username walletBalance')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's match history
const getUserMatchHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const matches = await Match.find({
      'players.userId': userId,
      status: 'completed'
    })
      .populate('winnerId', 'username')
      .populate('loserId', 'username')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Match.countDocuments({
      'players.userId': userId,
      status: 'completed'
    });

    res.json({
      success: true,
      matches,
      total,
      hasMore: skip + limit < total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get live leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await User.find({ isFrozen: false })
      .sort({ totalWinnings: -1 })
      .limit(parseInt(limit))
      .select('username totalWinnings totalGamesPlayed walletBalance');

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMatch,
  joinMatch,
  completeMatch,
  cancelMatch,
  getAvailableMatches,
  getUserMatchHistory,
  getLeaderboard
};
