const express = require('express');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const { Wallet, Transaction } = require('../models/Wallet');
const Game = require('../models/Game');

const router = express.Router();

// Admin middleware - only allow specific admin user
const adminOnly = (req, res, next) => {
  // Replace 'YOUR_ADMIN_ID' with your actual user ID
  if (!req.user || req.user._id.toString() !== process.env.ADMIN_USER_ID) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Get admin dashboard overview
router.get('/dashboard', adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWinnings = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$totalWinnings' } } }
    ]);
    const totalDeposits = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const activeGames = await Game.countDocuments({ status: 'playing' });

    // Recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalWinnings: totalWinnings[0]?.total || 0,
        totalDeposits: totalDeposits[0]?.total || 0,
        activeGames,
        platformBalance: totalDeposits[0]?.total || 0
      },
      recentTransactions
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data'
    });
  }
});

// Get all users with their wallets
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('username email avatar level gamesPlayed gamesWon totalWinnings isBlocked')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get wallet info for each user
    const usersWithWallets = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id });
        return {
          ...user.toObject(),
          balance: wallet?.balance || 0,
          totalSpent: wallet?.totalSpent || 0,
          totalWinnings: wallet?.totalWinnings || 0
        };
      })
    );

    res.json({
      success: true,
      users: usersWithWallets,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
});

// Get all transactions
router.get('/transactions', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, userId } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (userId) query.userId = userId;

    const transactions = await Transaction.find(query)
      .populate('userId', 'username avatar')
      .populate('gameId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    // Calculate totals
    const totals = await Transaction.aggregate([
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      totals
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions'
    });
  }
});

// Update user balance (admin only)
router.post('/user/:userId/balance', adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, type } = req.body;

    if (!amount || !type) {
      return res.status(400).json({
        success: false,
        error: 'Amount and type are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Add transaction
    await wallet.addTransaction({
      type: `admin_${type}`,
      amount,
      description: `Admin ${type}: ${amount}`,
      status: 'completed'
    });

    // Update balance
    await wallet.updateBalance(amount, type);

    res.json({
      success: true,
      message: `User balance updated by ${type} of $${amount}`,
      newBalance: wallet.balance
    });

  } catch (error) {
    console.error('Update user balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user balance'
    });
  }
});

// Block/unblock user
router.post('/user/:userId/block', adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked },
      { new: true }
    );

    res.json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        isBlocked
      }
    });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
});

// Get platform statistics
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    let dateFilter = {};
    if (timeframe === '24h') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } };
    } else if (timeframe === '7d') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === '30d') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    // Game stats
    const gamesPlayed = await Game.countDocuments(dateFilter);
    const totalWagered = await Game.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$entryFee' } } }
    ]);

    // User stats
    const newUsers = await User.countDocuments({
      createdAt: dateFilter
    });

    // Transaction stats
    const transactions = await Transaction.aggregate([
      { $match: { ...dateFilter, type: { $in: ['game_win', 'instant_win'] } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        timeframe,
        gamesPlayed,
        totalWagered: totalWagered[0]?.total || 0,
        newUsers,
        totalWon: transactions[0]?.total || 0,
        totalWins: transactions[0]?.count || 0
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

// Process withdrawals (admin approval)
router.post('/withdrawals/approve', adminOnly, async (req, res) => {
  try {
    const { withdrawalId, status } = req.body;

    // In a real system, you'd have a withdrawals collection
    // For now, this is a placeholder for withdrawal approval
    
    res.json({
      success: true,
      message: `Withdrawal ${withdrawalId} ${status}`,
      withdrawalId,
      status
    });

  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process withdrawal'
    });
  }
});

// Get system health
router.get('/health', adminOnly, async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const activeGames = instantGames.size;
    const memoryUsage = process.memoryUsage();
    
    res.json({
      success: true,
      health: {
        database: dbStatus === 1 ? 'connected' : 'disconnected',
        activeGames,
        uptime: process.uptime(),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        }
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system health'
    });
  }
});

module.exports = router;
