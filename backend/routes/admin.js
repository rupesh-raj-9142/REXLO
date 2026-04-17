const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { Wallet, Transaction } = require('../models/Wallet');
const Game = require('../models/Game');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticate);
router.use(adminOnly);

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const activeUsers = await User.countDocuments({ isOnline: true, isAdmin: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    
    const totalGames = await Game.countDocuments();
    const activeGames = await Game.countDocuments({ status: 'playing' });
    const completedGames = await Game.countDocuments({ status: 'completed' });

    const totalRevenue = await Transaction.aggregate([
      { $match: { type: 'game_entry', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalWinnings = await Transaction.aggregate([
      { $match: { type: 'game_win', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingWithdrawals = await Transaction.countDocuments({
      type: 'withdrawal',
      status: 'pending'
    });

    res.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers
        },
        games: {
          total: totalGames,
          active: activeGames,
          completed: completedGames
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          winnings: totalWinnings[0]?.total || 0,
          profit: (totalRevenue[0]?.total || 0) - (totalWinnings[0]?.total || 0)
        },
        pendingWithdrawals
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const filter = { isAdmin: false };
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'blocked') {
      filter.isBlocked = true;
    } else if (status === 'active') {
      filter.isBlocked = false;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block/Unblock user
router.put('/users/:userId/block', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ message: 'Cannot block admin user' });
    }

    user.isBlocked = isBlocked;
    user.isOnline = false;
    await user.save();

    res.json({
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all games
router.get('/games', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, gameType } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    if (gameType) {
      filter.name = gameType;
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
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending withdrawals
router.get('/withdrawals/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const withdrawals = await Transaction.find({
      type: 'withdrawal',
      status: 'pending'
    })
      .populate('userId', 'username email fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments({
      type: 'withdrawal',
      status: 'pending'
    });

    res.json({
      withdrawals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get pending withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject withdrawal
router.put('/withdrawals/:withdrawalId', [
  body('status').isIn(['completed', 'cancelled']),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { withdrawalId } = req.params;
    const { status, reason } = req.body;

    const withdrawal = await Transaction.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }

    withdrawal.status = status;
    if (reason) {
      withdrawal.description += ` - ${reason}`;
    }

    await withdrawal.save();

    // If approved, update wallet and user stats
    if (status === 'completed') {
      const wallet = await Wallet.findOne({ userId: withdrawal.userId });
      if (wallet) {
        wallet.totalWithdrawn += withdrawal.amount;
        await wallet.save();
      }
    } else if (status === 'cancelled') {
      // Refund the amount back to wallet
      const wallet = await Wallet.findOne({ userId: withdrawal.userId });
      if (wallet) {
        await wallet.updateBalance(withdrawal.amount, 'refund');
        await wallet.save();
      }
    }

    res.json({
      message: `Withdrawal ${status} successfully`,
      withdrawal
    });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let groupBy;
    let startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        groupBy = { $dateToString: { format: "%H:00", date: "$createdAt" } };
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const revenueData = await Transaction.aggregate([
      {
        $match: {
          type: 'game_entry',
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const winningsData = await Transaction.aggregate([
      {
        $match: {
          type: 'game_win',
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          winnings: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      period,
      revenue: revenueData,
      winnings: winningsData
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
