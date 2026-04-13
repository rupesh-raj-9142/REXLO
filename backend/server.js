const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please create a .env file with these variables.');
  process.exit(1);
}

// Optional: Warn about Razorpay
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  Razorpay keys not configured. Payment features will be disabled.');
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/match', require('./routes/match'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/game', require('./routes/game'));

// Socket.io for Real-time Matchmaking
const waitingRoom = new Map(); // userId -> { socketId, entryFee, gameId }
const activeGames = new Map(); // matchId -> { gameInstance, gameType }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-waiting-room', async ({ userId, entryFee, gameId }) => {
    console.log(`User ${userId} joined waiting room for game ${gameId}`);
    
    try {
      // Check if another player is waiting for the same game and entry fee
      for (const [waitingUserId, waitingData] of waitingRoom.entries()) {
        if (waitingData.gameId === gameId && waitingData.entryFee === entryFee && waitingUserId !== userId) {
          // Match found! Start game
          const player1 = waitingData.socketId;
          const player2 = socket.id;
          
          const Match = require('./models/Match');
          const Game = require('./models/Game');
          const { processTransaction } = require('./controllers/walletController');
          
          // Get game details
          const game = await Game.findOne({ gameId });
          const platformFee = Math.round(entryFee * 0.1);
          const prizePool = (entryFee * 2) - platformFee;
          
          // Create match
          const match = new Match({
            gameId,
            gameName: game.name,
            entryFee,
            prizePool,
            platformFee,
            status: 'active',
            players: [
              { userId: waitingUserId, socketId: player1 },
              { userId, socketId: player2 }
            ],
            startedAt: new Date()
          });
          
          await match.save();
          
          // Deduct entry fees from both players
          await processTransaction(waitingUserId, 'entry_fee', entryFee, `Entry fee for match ${match._id}`, { matchId: match._id });
          await processTransaction(userId, 'entry_fee', entryFee, `Entry fee for match ${match._id}`, { matchId: match._id });
          
          // Notify both players
          io.to(player1).emit('match-found', { 
            matchId: match._id, 
            opponentId: userId, 
            isPlayer1: true,
            prizePool
          });
          io.to(player2).emit('match-found', { 
            matchId: match._id, 
            opponentId: waitingUserId, 
            isPlayer1: false,
            prizePool
          });
          
          waitingRoom.delete(waitingUserId);
          return;
        }
      }
      
      // No match found, add to waiting room
      waitingRoom.set(userId, { socketId: socket.id, entryFee, gameId });
      socket.emit('waiting-for-opponent');
    } catch (error) {
      console.error('Error in join-waiting-room:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Game-specific handlers
  socket.on('join-game', ({ matchId, userId, gameType }) => {
    console.log(`User ${userId} joining ${gameType} game ${matchId}`);
    
    if (!activeGames.has(matchId)) {
      // Create new game instance
      if (gameType === 'ludo') {
        const LudoGame = require('./games/ludoLogic');
        const game = new LudoGame(matchId, [userId]);
        activeGames.set(matchId, { gameInstance: game, gameType });
      } else if (gameType === 'carrom') {
        const CarromGame = require('./games/carromLogic');
        const game = new CarromGame(matchId, [userId]);
        activeGames.set(matchId, { gameInstance: game, gameType });
      }
    } else {
      // Add second player to existing game
      const gameData = activeGames.get(matchId);
      gameData.gameInstance.players.push(userId);
      gameData.gameInstance.state = 'playing';
    }
    
    const gameData = activeGames.get(matchId);
    socket.emit('game-state', gameData.gameInstance.getGameState());
  });

  // Ludo handlers
  socket.on('roll-dice', ({ matchId, userId }) => {
    const gameData = activeGames.get(matchId);
    if (!gameData || gameData.gameType !== 'ludo') return;
    
    const game = gameData.gameInstance;
    if (game.currentPlayer !== game.players.indexOf(userId)) return;
    
    const diceValue = game.rollDice();
    socket.emit('dice-rolled', diceValue);
    
    // Broadcast new state to all players in match
    io.emit('game-state', game.getGameState());
  });

  socket.on('move-piece', ({ matchId, userId, pieceId, diceValue }) => {
    const gameData = activeGames.get(matchId);
    if (!gameData || gameData.gameType !== 'ludo') return;
    
    const game = gameData.gameInstance;
    const result = game.movePiece(userId, pieceId);
    
    if (result.success) {
      // Check for captures
      game.checkCapture(userId, result.position);
      
      // Check if game finished
      if (game.winner) {
        io.emit('game-finished', game.winner);
      } else {
        // Next turn
        game.nextTurn();
      }
      
      io.emit('game-state', game.getGameState());
    }
  });

  // Carrom handlers
  socket.on('set-striker', ({ matchId, userId, x, y }) => {
    const gameData = activeGames.get(matchId);
    if (!gameData || gameData.gameType !== 'carrom') return;
    
    const game = gameData.gameInstance;
    game.setStrikerPosition(x, y);
    io.emit('game-state', game.getGameState());
  });

  socket.on('shoot-striker', ({ matchId, userId, vx, vy }) => {
    const gameData = activeGames.get(matchId);
    if (!gameData || gameData.gameType !== 'carrom') return;
    
    const game = gameData.gameInstance;
    game.shootStriker(vx, vy);
    
    // Start physics loop for this game
    const physicsInterval = setInterval(() => {
      game.updatePhysics();
      io.emit('game-updated', game.getGameState());
      
      if (game.state === 'aiming' || game.state === 'finished') {
        clearInterval(physicsInterval);
        if (game.winner) {
          io.emit('game-finished', game.winner);
        }
      }
    }, 16); // 60 FPS
  });

  // Legacy game-move handler
  socket.on('game-move', async (data) => {
    try {
      const { detectFraud } = require('./controllers/fraudDetection');
      
      // Analyze reaction time for fraud detection
      if (data.reactionTime && data.userId) {
        const fraudResult = await detectFraud(data.userId, {
          reactionTime: data.reactionTime,
          activityType: 'game_move'
        });

        if (fraudResult.shouldFreeze) {
          socket.emit('account-frozen', { 
            message: 'Account frozen due to suspicious activity',
            alerts: fraudResult.alerts
          });
          return;
        }
      }
      
      // Broadcast move to opponent
      io.to(data.opponentSocketId).emit('opponent-move', data.move);
    } catch (error) {
      console.error('Error in game-move:', error);
    }
  });

  socket.on('game-end', async (data) => {
    try {
      const { winnerId, loserId, matchId } = data;
      
      const Match = require('./models/Match');
      const { processTransaction } = require('./controllers/walletController');
      
      const match = await Match.findById(matchId);
      if (!match) return;
      
      match.status = 'completed';
      match.winnerId = winnerId;
      match.loserId = loserId;
      match.completedAt = new Date();
      
      await match.save();
      
      // Add winnings to winner
      await processTransaction(winnerId, 'winnings', match.prizePool, `Winnings from match ${matchId}`, { matchId });
      
      // Notify both players
      io.emit('game-completed', { winnerId, matchId, prizePool: match.prizePool });
    } catch (error) {
      console.error('Error in game-end:', error);
    }
  });

  socket.on('leave-waiting-room', (userId) => {
    waitingRoom.delete(userId);
    socket.emit('left-waiting-room');
  });

  socket.on('disconnect', () => {
    // Remove from waiting room if disconnected
    for (const [userId, data] of waitingRoom.entries()) {
      if (data.socketId === socket.id) {
        waitingRoom.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
