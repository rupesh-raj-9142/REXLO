const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['ludo', 'carrom']
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'completed', 'cancelled'],
    default: 'waiting'
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    max: 4
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
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isReady: {
      type: Boolean,
      default: false
    },
    position: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 0
    },
    hasLeft: {
      type: Boolean,
      default: false
    }
  }],
  gameState: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winnerAmount: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  duration: {
    type: Number
  },
  roomCode: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Generate room code before saving
gameSchema.pre('save', function(next) {
  if (!this.roomCode) {
    this.roomCode = this.generateRoomCode();
  }
  next();
});

// Generate unique room code
gameSchema.methods.generateRoomCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Add player to game
gameSchema.methods.addPlayer = function(userId, username) {
  if (this.players.length >= this.maxPlayers) {
    throw new Error('Game is full');
  }
  
  const existingPlayer = this.players.find(p => p.userId.toString() === userId.toString());
  if (existingPlayer) {
    throw new Error('Player already in game');
  }
  
  this.players.push({
    userId,
    username,
    joinedAt: new Date()
  });
  
  if (this.players.length === this.maxPlayers) {
    this.status = 'playing';
    this.startedAt = new Date();
  }
  
  return this.save();
};

// Remove player from game
gameSchema.methods.removePlayer = function(userId) {
  const playerIndex = this.players.findIndex(p => p.userId.toString() === userId.toString());
  if (playerIndex === -1) {
    throw new Error('Player not found in game');
  }
  
  this.players[playerIndex].hasLeft = true;
  
  if (this.status === 'waiting') {
    this.players.splice(playerIndex, 1);
  }
  
  return this.save();
};

// Set game winner
gameSchema.methods.setWinner = function(userId, amount) {
  this.winner = userId;
  this.winnerAmount = amount;
  this.status = 'completed';
  this.completedAt = new Date();
  this.duration = this.completedAt - this.startedAt;
  
  return this.save();
};

// Calculate prize pool based on entry fee
gameSchema.methods.calculatePrizePool = function() {
  this.prizePool = this.entryFee * this.players.length;
  // Platform takes 10% commission
  this.winnerAmount = Math.floor(this.prizePool * 0.9);
  return this.winnerAmount;
};

module.exports = mongoose.model('Game', gameSchema);
