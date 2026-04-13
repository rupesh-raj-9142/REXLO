const express = require('express');
const router = express.Router();
const {
  createMatch,
  joinMatch,
  completeMatch,
  cancelMatch,
  getAvailableMatches,
  getUserMatchHistory,
  getLeaderboard
} = require('../controllers/matchController');
const { verifyToken } = require('../controllers/authController');

// Create a new match (protected - money operation)
router.post('/create', verifyToken, createMatch);

// Join a match (protected - money operation)
router.post('/join', verifyToken, joinMatch);

// Complete match (protected - money operation)
router.post('/complete', verifyToken, completeMatch);

// Cancel match (protected - money operation)
router.post('/cancel', verifyToken, cancelMatch);

// Get available matches (public - no auth needed)
router.get('/available', getAvailableMatches);

// Get user match history (protected - sensitive data)
router.get('/history/:userId', verifyToken, getUserMatchHistory);

// Get leaderboard (public - no auth needed)
router.get('/leaderboard', getLeaderboard);

module.exports = router;
