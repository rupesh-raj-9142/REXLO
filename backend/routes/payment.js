const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, withdrawMoney } = require('../controllers/paymentController');
const { verifyToken } = require('../controllers/authController');

// Create Razorpay order (protected - money operation)
router.post('/create-order', verifyToken, createOrder);

// Verify payment (protected - money operation)
router.post('/verify', verifyToken, verifyPayment);

// Withdraw money (protected - money operation)
router.post('/withdraw', verifyToken, withdrawMoney);

module.exports = router;
