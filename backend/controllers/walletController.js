const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Atomic wallet transaction with MongoDB session
const processTransaction = async (userId, type, amount, description = '', metadata = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    
    if (!user) {
      throw new Error('User not found');
    }

    const balanceBefore = user.walletBalance;
    let balanceAfter = balanceBefore;

    // Calculate new balance based on transaction type
    switch (type) {
      case 'deposit':
      case 'winnings':
      case 'refund':
      case 'bonus':
        balanceAfter += amount;
        break;
      case 'withdraw':
      case 'entry_fee':
        if (balanceBefore < amount) {
          throw new Error('Insufficient balance');
        }
        balanceAfter -= amount;
        break;
      default:
        throw new Error('Invalid transaction type');
    }

    // Update user balance
    user.walletBalance = balanceAfter;
    
    if (type === 'winnings') {
      user.totalWinnings += amount;
    }

    await user.save({ session });

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      ...metadata
    });

    await transaction.save({ session });

    // Add transaction to user's history
    user.transactionHistory.push(transaction._id);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      transaction,
      newBalance: balanceAfter
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Deposit money to wallet
const depositMoney = async (req, res) => {
  try {
    const { userId, amount, paymentId, paymentGateway } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid deposit request' 
      });
    }

    const result = await processTransaction(
      userId,
      'deposit',
      amount,
      'Money deposited to wallet',
      { paymentId, paymentGateway }
    );

    res.json({
      success: true,
      message: 'Deposit successful',
      newBalance: result.newBalance,
      transaction: result.transaction
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Deduct entry fee
const deductEntryFee = async (req, res) => {
  try {
    const { userId, amount, matchId } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid entry fee request' 
      });
    }

    const result = await processTransaction(
      userId,
      'entry_fee',
      amount,
      `Entry fee for match`,
      { matchId }
    );

    res.json({
      success: true,
      message: 'Entry fee deducted',
      newBalance: result.newBalance,
      transaction: result.transaction
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Add winnings to wallet
const addWinnings = async (req, res) => {
  try {
    const { userId, amount, matchId } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid winnings request' 
      });
    }

    const result = await processTransaction(
      userId,
      'winnings',
      amount,
      `Winnings from match`,
      { matchId }
    );

    res.json({
      success: true,
      message: 'Winnings added to wallet',
      newBalance: result.newBalance,
      transaction: result.transaction
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Refund entry fee
const refundEntryFee = async (req, res) => {
  try {
    const { userId, amount, matchId, reason } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid refund request' 
      });
    }

    const result = await processTransaction(
      userId,
      'refund',
      amount,
      reason || 'Entry fee refunded',
      { matchId }
    );

    res.json({
      success: true,
      message: 'Refund processed',
      newBalance: result.newBalance,
      transaction: result.transaction
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get wallet balance
const getWalletBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('transactionHistory')
      .sort({ createdAt: -1 });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      walletBalance: user.walletBalance,
      totalWinnings: user.totalWinnings,
      totalGamesPlayed: user.totalGamesPlayed,
      transactionHistory: user.transactionHistory.slice(0, 20) // Last 20 transactions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Transaction.countDocuments({ userId });

    res.json({
      success: true,
      transactions,
      total,
      hasMore: skip + limit < total
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  processTransaction,
  depositMoney,
  deductEntryFee,
  addWinnings,
  refundEntryFee,
  getWalletBalance,
  getTransactionHistory
};
