const User = require('../models/User');
const Game = require('../models/Game');
const Match = require('../models/Match');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalGames,
      totalMatches,
      totalTransactions,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 24*60*60*1000) } }),
      Game.countDocuments(),
      Match.countDocuments(),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { type: 'deposit' } },
        { $group: { _id: null, total: { $sum: '$amount' } }
      ])
    ]);

    const recentMatches = await Match.find()
      .sort({ startedAt: -1 })
      .limit(10)
      .populate('players.userId', 'username email');

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username email');

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalGames,
        totalMatches,
        totalTransactions,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentMatches,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all users with pagination
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, isBanned, isAdmin } = req.body;

    await User.findByIdAndUpdate(userId, {
      isActive,
      isBanned,
      isAdmin
    });

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all games
const getGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ totalMatchesPlayed: -1 });
    res.json({
      success: true,
      games
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update game status
const updateGameStatus = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { isActive } = req.body;

    await Game.findOneAndUpdate({ gameId }, { isActive });

    res.json({
      success: true,
      message: 'Game updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get matches with filters
const getMatches = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'all';

    let query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const matches = await Match.find(query)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('players.userId', 'username email');

    const total = await Match.countDocuments(query);

    res.json({
      success: true,
      matches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get transactions with filters
const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type || 'all';
    const userId = req.query.userId;

    let query = {};
    if (type !== 'all') {
      query.type = type;
    }
    if (userId) {
      query.userId = userId;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email');

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get fraud alerts
const getFraudAlerts = async (req, res) => {
  try {
    const { detectFraud } = require('./fraudDetection');
    
    // Get users with suspicious activity
    const users = await User.find({
      $or: [
        { isFrozen: true },
        { fraudScore: { $gt: 0.7 } }
      ]
    }).select('username email fraudScore isFrozen lastLogin');

    res.json({
      success: true,
      alerts: users.map(user => ({
        userId: user._id,
        username: user.username,
        email: user.email,
        fraudScore: user.fraudScore || 0,
        isFrozen: user.isFrozen || false,
        lastLogin: user.lastLogin
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Freeze/Unfreeze user account
const toggleUserFreeze = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isFrozen, reason } = req.body;

    await User.findByIdAndUpdate(userId, {
      isFrozen,
      freezeReason: reason
    });

    res.json({
      success: true,
      message: `User ${isFrozen ? 'frozen' : 'unfrozen'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getGames,
  updateGameStatus,
  getMatches,
  getTransactions,
  getFraudAlerts,
  toggleUserFreeze
};
