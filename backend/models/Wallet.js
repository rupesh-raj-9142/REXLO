const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAdded: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  totalWinnings: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  isFrozen: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'game_entry', 'game_win', 'refund', 'bonus'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  },
  paymentId: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Add transaction method
walletSchema.methods.addTransaction = async function(transactionData) {
  const Transaction = mongoose.model('Transaction');
  const transaction = new Transaction({
    ...transactionData,
    userId: this.userId
  });
  
  await transaction.save();
  return transaction;
};

// Update balance method
walletSchema.methods.updateBalance = async function(amount, type) {
  if (type === 'deposit' || type === 'game_win' || type === 'refund' || type === 'bonus') {
    this.balance += amount;
  } else if (type === 'withdrawal' || type === 'game_entry') {
    if (this.balance < amount) {
      throw new Error('Insufficient balance');
    }
    this.balance -= amount;
  }
  
  await this.save();
  return this.balance;
};

const Wallet = mongoose.model('Wallet', walletSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Wallet, Transaction };
