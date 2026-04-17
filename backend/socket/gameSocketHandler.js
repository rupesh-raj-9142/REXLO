const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Game = require('../models/Game');
const { Wallet, Transaction } = require('../models/Wallet');
const CarromGame = require('../games/carromGame');
const LudoGame = require('../games/ludoGame');

const gameSocketHandler = (io) => {
  // Store active game rooms
  const gameRooms = new Map();

  // Authentication middleware for socket connections
  const authenticateSocket = async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user || user.isBlocked) {
        return next(new Error('User not found or blocked'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  };

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join game room
    socket.on('joinGame', async (gameId) => {
      try {
        const game = await Game.findById(gameId)
          .populate('players.userId', 'username avatar level');

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Check if user is in the game
        const player = game.players.find(p => 
          p.userId._id.toString() === socket.user._id.toString()
        );

        if (!player) {
          socket.emit('error', { message: 'Not a player in this game' });
          return;
        }

        // Join socket room
        socket.join(gameId);
        socket.currentGameId = gameId;

        // Initialize game room if not exists
        if (!gameRooms.has(gameId)) {
          const gameInstance = game.name === 'carrom' ? new CarromGame() : new LudoGame();
          gameInstance.initializePlayers(game.players.length);
          
          // Map users to player indices
          game.players.forEach((player, index) => {
            gameInstance.gameState.players[index].userId = player.userId;
            gameInstance.gameState.players[index].username = player.username;
          });
          
          gameRooms.set(gameId, {
            game: game,
            gameInstance: gameInstance,
            gameState: gameInstance.getGameState(),
            players: new Map(),
            playerMapping: new Map() // userId -> playerIndex
          });
          
          // Create player mapping
          game.players.forEach((player, index) => {
            const room = gameRooms.get(gameId);
            room.playerMapping.set(player.userId.toString(), index);
          });
        }

        const room = gameRooms.get(gameId);
        room.players.set(socket.user._id.toString(), {
          socketId: socket.id,
          user: socket.user,
          isReady: player.isReady
        });

        // Notify all players
        io.to(gameId).emit('playerJoined', {
          game: room.game,
          playerCount: room.players.size
        });

        // Start game if all players are ready
        if (game.status === 'playing' && room.players.size === game.maxPlayers) {
          startGame(gameId, room);
        }

      } catch (error) {
        console.error('Join game error:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Leave game room
    socket.on('leaveGame', async () => {
      if (!socket.currentGameId) return;

      try {
        const gameId = socket.currentGameId;
        const room = gameRooms.get(gameId);

        if (room) {
          room.players.delete(socket.user._id.toString());
          
          // Remove from socket room
          socket.leave(gameId);

          // Update game in database
          await Game.findByIdAndUpdate(gameId, {
            $pull: { players: { userId: socket.user._id } }
          });

          // Notify remaining players
          io.to(gameId).emit('playerLeft', {
            userId: socket.user._id,
            username: socket.user.username
          });

          // Clean up room if empty
          if (room.players.size === 0) {
            gameRooms.delete(gameId);
          }
        }

        socket.currentGameId = null;
      } catch (error) {
        console.error('Leave game error:', error);
      }
    });

    // Handle game-specific moves
    socket.on('gameMove', (moveData) => {
      if (!socket.currentGameId) return;

      const room = gameRooms.get(socket.currentGameId);
      if (!room) return;

      try {
        // Use the game instance to process moves
        const result = room.gameInstance.processMove(moveData, socket.user._id.toString());
        
        if (result.success) {
          room.gameState = result.newGameState;
          
          // Broadcast move to all players
          io.to(socket.currentGameId).emit('gameUpdate', {
            gameState: room.gameState,
            move: moveData,
            player: socket.user.username,
            result: result.result
          });

          // Check for game winner
          if (result.winner) {
            endGame(socket.currentGameId, result.winner);
          }
        } else {
          socket.emit('moveError', { message: result.error });
        }
      } catch (error) {
        console.error('Game move error:', error);
        socket.emit('error', { message: 'Invalid move' });
      }
    });

    // Handle player ready
    socket.on('playerReady', async () => {
      if (!socket.currentGameId) return;

      try {
        const game = await Game.findById(socket.currentGameId);
        const playerIndex = game.players.findIndex(p => 
          p.userId.toString() === socket.user._id.toString()
        );

        if (playerIndex !== -1) {
          game.players[playerIndex].isReady = true;
          await game.save();

          const room = gameRooms.get(socket.currentGameId);
          if (room) {
            const player = room.players.get(socket.user._id.toString());
            if (player) {
              player.isReady = true;
            }
          }

          io.to(socket.currentGameId).emit('playerReady', {
            userId: socket.user._id,
            username: socket.user.username
          });
        }
      } catch (error) {
        console.error('Player ready error:', error);
      }
    });

    // Handle chat messages
    socket.on('chatMessage', (message) => {
      if (!socket.currentGameId) return;

      io.to(socket.currentGameId).emit('chatMessage', {
        userId: socket.user._id,
        username: socket.user.username,
        message,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);

      if (socket.currentGameId) {
        const room = gameRooms.get(socket.currentGameId);
        
        if (room) {
          room.players.delete(socket.user._id.toString());
          
          // Update user online status
          await User.findByIdAndUpdate(socket.user._id, { isOnline: false });

          // Notify remaining players
          io.to(socket.currentGameId).emit('playerDisconnected', {
            userId: socket.user._id,
            username: socket.user.username
          });

          // Clean up room if empty
          if (room.players.size === 0) {
            gameRooms.delete(socket.currentGameId);
          }
        }
      }
    });
  });

  // Initialize game state based on game type
  function initializeGameState(gameType, playerCount) {
    if (gameType === 'ludo') {
      return {
        type: 'ludo',
        currentPlayer: 0,
        dice: 0,
        players: Array.from({ length: playerCount }, (_, i) => ({
          id: i,
          pieces: Array.from({ length: 4 }, (_, j) => ({
            id: j,
            position: -1, // -1 means in base
            isHome: false
          }))
        })),
        board: Array(52).fill(null),
        gameStarted: false
      };
    } else if (gameType === 'carrom') {
      return {
        type: 'carrom',
        currentPlayer: 0,
        players: Array.from({ length: playerCount }, (_, i) => ({
          id: i,
          coins: [],
          striker: { x: 50, y: 80 }
        })),
        coins: {
          black: Array.from({ length: 9 }, () => ({ x: 0, y: 0, active: true })),
          white: Array.from({ length: 9 }, () => ({ x: 0, y: 0, active: true })),
          red: { x: 50, y: 50, active: true }
        },
        gameStarted: false
      };
    }
  }

  // Process game moves
  function processGameMove(gameState, moveData, userId) {
    if (gameState.type === 'ludo') {
      return processLudoMove(gameState, moveData, userId);
    } else if (gameState.type === 'carrom') {
      return processCarromMove(gameState, moveData, userId);
    }
    return { success: false, error: 'Invalid game type' };
  }

  // Ludo move processing
  function processLudoMove(gameState, moveData, userId) {
    // Simplified Ludo logic
    const { dice, pieceId } = moveData;
    
    if (dice < 1 || dice > 6) {
      return { success: false, error: 'Invalid dice roll' };
    }

    // Find player index (simplified - would need proper mapping)
    const playerIndex = 0; // This should map userId to player index
    
    const player = gameState.players[playerIndex];
    const piece = player.pieces.find(p => p.id === pieceId);
    
    if (!piece) {
      return { success: false, error: 'Piece not found' };
    }

    // Move piece
    let newPosition = piece.position;
    if (piece.position === -1 && dice === 6) {
      newPosition = 0; // Move out of base
    } else if (piece.position >= 0) {
      newPosition = (piece.position + dice) % 52;
    }

    piece.position = newPosition;
    piece.isHome = newPosition >= 51; // Simplified home condition

    // Check winner
    const allHome = player.pieces.every(p => p.isHome);
    let winner = null;
    if (allHome) {
      winner = playerIndex;
    }

    // Switch player
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;

    return {
      success: true,
      newGameState: gameState,
      winner
    };
  }

  // Carrom move processing
  function processCarromMove(gameState, moveData, userId) {
    // Simplified Carrom logic
    const { strikerX, strikerY, velocity } = moveData;
    
    const playerIndex = 0; // This should map userId to player index
    const player = gameState.players[playerIndex];
    
    // Update striker position
    player.striker = { x: strikerX, y: strikerY };

    // Simulate coin hits (simplified)
    // In real implementation, would calculate collisions
    
    // Switch player
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;

    return {
      success: true,
      newGameState: gameState
    };
  }

  // Start game
  function startGame(gameId, room) {
    room.gameInstance.gameState.gameStarted = true;
    room.gameState = room.gameInstance.getGameState();
    
    io.to(gameId).emit('gameStarted', {
      gameState: room.gameState,
      game: room.game,
      gameType: room.game.name
    });
  }

  // End game
  async function endGame(gameId, winnerData) {
    try {
      const room = gameRooms.get(gameId);
      if (!room) return;

      const game = room.game;
      const winnerPlayerIndex = winnerData.playerIndex;
      const winnerPlayer = game.players[winnerPlayerIndex];
      
      // Update game in database
      game.winner = winnerPlayer.userId;
      game.status = 'completed';
      game.completedAt = new Date();
      game.winnerAmount = game.calculatePrizePool();
      game.gameState = room.gameState; // Save final game state
      await game.save();

      // Add winnings to winner's wallet
      const wallet = await Wallet.findOne({ userId: winnerPlayer.userId });
      if (wallet) {
        await wallet.addTransaction({
          type: 'game_win',
          amount: game.winnerAmount,
          description: `Won ${game.name} game`,
          status: 'completed',
          gameId: game._id
        });

        await wallet.updateBalance(game.winnerAmount, 'game_win');
        wallet.totalWinnings += game.winnerAmount;
        await wallet.save();
      }

      // Update user stats
      await User.findByIdAndUpdate(winnerPlayer.userId, {
        $inc: { gamesWon: 1, totalWinnings: game.winnerAmount }
      });

      // Notify all players
      io.to(gameId).emit('gameEnded', {
        winner: winnerPlayer.userId,
        winnerUsername: winnerPlayer.username,
        winnerAmount: game.winnerAmount,
        game,
        winnerData,
        finalGameState: room.gameState
      });

      // Clean up room
      gameRooms.delete(gameId);
    } catch (error) {
      console.error('End game error:', error);
    }
  }
};

module.exports = gameSocketHandler;
