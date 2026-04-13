const Game = require('../models/Game');

// Seed sample games
const seedGames = async (req, res) => {
  try {
    // Clear existing games
    await Game.deleteMany({});
    
    const sampleGames = [
      {
        name: 'Ludo',
        gameId: 'ludo_classic',
        description: 'Classic Ludo board game for 2-4 players',
        category: 'strategy',
        gameType: 'ludo',
        minPlayers: 2,
        maxPlayers: 4,
        entryFees: [
          { amount: 10, prizePool: 18 },
          { amount: 50, prizePool: 90 },
          { amount: 100, prizePool: 180 }
        ],
        image: 'ludo',
        rules: [
          'Roll 6 to start moving pieces',
          'Move pieces around the board',
          'Capture opponent pieces by landing on them',
          'First to get all 4 pieces home wins'
        ],
        avgDuration: 15
      },
      {
        name: 'Carrom',
        gameId: 'carrom_classic',
        description: 'Traditional Carrom board game',
        category: 'skill',
        gameType: 'carrom',
        minPlayers: 2,
        maxPlayers: 4,
        entryFees: [
          { amount: 10, prizePool: 18 },
          { amount: 50, prizePool: 90 },
          { amount: 100, prizePool: 180 }
        ],
        image: 'carrom',
        rules: [
          'Pocket coins using striker',
          'Queen (red) requires cover',
          'First to pocket queen + 8 coins wins',
          'Pocket striker = foul'
        ],
        avgDuration: 20
      },
      {
        name: 'Speed Chess',
        gameId: 'chess_speed',
        description: 'Fast-paced chess matches with 5-minute timers',
        category: 'strategy',
        gameType: 'chess',
        minPlayers: 2,
        maxPlayers: 2,
        entryFees: [
          { amount: 10, prizePool: 18 },
          { amount: 50, prizePool: 90 },
          { amount: 100, prizePool: 180 }
        ],
        image: 'chess',
        rules: [
          '5-minute blitz chess',
          'Standard chess rules apply',
          'First to checkmate or time out loses'
        ],
        avgDuration: 5
      },
      {
        name: 'Quick Quiz',
        gameId: 'quiz_quick',
        description: 'Test your knowledge in rapid-fire trivia battles',
        category: 'quiz',
        gameType: 'rummy',
        minPlayers: 2,
        maxPlayers: 2,
        entryFees: [
          { amount: 5, prizePool: 9 },
          { amount: 25, prizePool: 45 },
          { amount: 50, prizePool: 90 }
        ],
        image: 'quiz',
        rules: [
          '10 questions per round',
          '10 seconds per question',
          'Most correct answers wins'
        ],
        avgDuration: 3
      }
    ];

    await Game.insertMany(sampleGames);

    res.json({
      success: true,
      message: 'Sample games seeded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all active games
const getAllGames = async (req, res) => {
  try {
    const games = await Game.find({ isActive: true })
      .sort({ totalMatchesPlayed: -1 });

    res.json({
      success: true,
      games
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get game by ID
const getGameById = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findOne({ gameId });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  seedGames,
  getAllGames,
  getGameById
};
