const express = require('express');
const router = express.Router();
const { seedGames, getAllGames, getGameById } = require('../controllers/gameController');

// Seed sample games (dev only)
router.post('/seed', seedGames);

// Get all games
router.get('/', getAllGames);

// Get game by ID
router.get('/:gameId', getGameById);

module.exports = router;
