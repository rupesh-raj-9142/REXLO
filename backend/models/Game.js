const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['skill', 'strategy', 'quiz', 'puzzle'],
    required: true
  },
  gameType: {
    type: String,
    enum: ['ludo', 'carrom', 'chess', 'rummy'],
    required: true
  },
  minPlayers: {
    type: Number,
    default: 2
  },
  maxPlayers: {
    type: Number,
    default: 2
  },
  entryFees: [{
    amount: Number,
    prizePool: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String
  },
  rules: [{
    type: String
  }],
  avgDuration: {
    type: Number,
    default: 5
  },
  totalMatchesPlayed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);
