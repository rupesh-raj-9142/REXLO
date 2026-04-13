const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  entryFee: {
    type: Number,
    required: true,
    min: 0
  },
  prizePool: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    socketId: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  loserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gameData: {
    type: mongoose.Schema.Types.Mixed
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ players: 1 });

module.exports = mongoose.model('Match', matchSchema);
