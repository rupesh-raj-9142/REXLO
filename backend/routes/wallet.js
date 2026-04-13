const express = require('express');
const router = express.Router();
const {
  depositMoney,
  deductEntryFee,
  addWinnings,
  refundEntryFee,
  getWalletBalance,
  getTransactionHistory
} = require('../controllers/walletController');
const { verifyToken } = require('../controllers/authController');

// Deposit money (protected - money operation)
router.post('/deposit', verifyToken, depositMoney);

// Deduct entry fee (protected - money operation)
router.post('/deduct-entry-fee', verifyToken, deductEntryFee);

// Add winnings (protected - money operation)
router.post('/add-winnings', verifyToken, addWinnings);

// Refund entry fee (protected - money operation)
router.post('/refund', verifyToken, refundEntryFee);

// Get wallet balance (protected - sensitive data)
router.get('/balance/:userId', verifyToken, getWalletBalance);

// Get transaction history (protected - sensitive data)
router.get('/history/:userId', verifyToken, getTransactionHistory);

module.exports = router;
