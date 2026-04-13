const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Dashboard statistics
router.get('/dashboard', adminAuth, adminController.getDashboardStats);

// User management
router.get('/users', adminAuth, adminController.getUsers);
router.put('/users/:userId', adminAuth, adminController.updateUserStatus);
router.put('/users/:userId/freeze', adminAuth, adminController.toggleUserFreeze);

// Game management
router.get('/games', adminAuth, adminController.getGames);
router.put('/games/:gameId', adminAuth, updateGameStatus);

// Match monitoring
router.get('/matches', adminAuth, adminController.getMatches);

// Transaction monitoring
router.get('/transactions', adminAuth, adminController.getTransactions);

// Fraud monitoring
router.get('/fraud-alerts', adminAuth, adminController.getFraudAlerts);

module.exports = router;
