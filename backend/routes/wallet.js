const express = require('express');
const { body, validationResult } = require('express-validator');
const { Wallet, Transaction } = require('../models/Wallet');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get wallet details
router.get('/', authenticate, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json({
      balance: wallet.balance,
      totalAdded: wallet.totalAdded,
      totalWithdrawn: wallet.totalWithdrawn,
      totalWinnings: wallet.totalWinnings,
      totalSpent: wallet.totalSpent,
      isFrozen: wallet.isFrozen
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction history
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const filter = { userId: req.user._id };
    
    if (type) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('gameId', 'name status entryFee');

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add money to wallet (Mock Razorpay)
router.post('/add', authenticate, [
  body('amount').isNumeric().isFloat({ min: 10, max: 10000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;
    const wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.isFrozen) {
      return res.status(403).json({ message: 'Wallet is frozen' });
    }

    // Mock payment processing
    const paymentId = 'razorpay_mock_' + Date.now();
    
    // Add transaction
    await wallet.addTransaction({
      type: 'deposit',
      amount,
      description: `Added ₹${amount} to wallet`,
      status: 'completed',
      paymentId
    });

    // Update wallet balance
    await wallet.updateBalance(amount, 'deposit');
    wallet.totalAdded += amount;
    await wallet.save();

    res.json({
      message: 'Money added successfully',
      balance: wallet.balance,
      transactionId: paymentId
    });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw money from wallet
router.post('/withdraw', authenticate, [
  body('amount').isNumeric().isFloat({ min: 100, max: 10000 }),
  body('accountDetails').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, accountDetails } = req.body;
    const wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.isFrozen) {
      return res.status(403).json({ message: 'Wallet is frozen' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Add withdrawal transaction (pending approval)
    await wallet.addTransaction({
      type: 'withdrawal',
      amount,
      description: `Withdrawal request for ₹${amount}`,
      status: 'pending',
      metadata: { accountDetails }
    });

    res.json({
      message: 'Withdrawal request submitted. Pending admin approval.',
      amount
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get withdrawal status
router.get('/withdrawals', authenticate, async (req, res) => {
  try {
    const withdrawals = await Transaction.find({
      userId: req.user._id,
      type: 'withdrawal'
    }).sort({ createdAt: -1 });

    res.json({ withdrawals });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
