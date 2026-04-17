const express = require('express');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user stats (internal use)
router.put('/stats/:userId', authenticate, async (req, res) => {
  try {
    const { gamesPlayed, gamesWon, totalWinnings, experience } = req.body;
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          gamesPlayed: gamesPlayed || 0,
          gamesWon: gamesWon || 0,
          totalWinnings: totalWinnings || 0,
          experience: experience || 0
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
