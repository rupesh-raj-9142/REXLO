const express = require('express');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const { Wallet, Transaction } = require('../models/Wallet');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Store active payment sessions
const paymentSessions = new Map();

// Generate QR code for payment
router.post('/generate-qr', authenticate, async (req, res) => {
  try {
    const { amount, gameType } = req.body;
    const userId = req.user._id;

    if (!amount || amount < 10 || amount > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be between $10 and $1000'
      });
    }

    // Generate unique payment session
    const paymentId = uuidv4();
    const paymentSession = {
      id: paymentId,
      userId,
      amount,
      gameType,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
    };

    paymentSessions.set(paymentId, paymentSession);

    // Generate QR code data (in real app, use a QR code library)
    const qrData = {
      paymentId,
      amount,
      gameType,
      timestamp: Date.now(),
      userId: userId
    };

    // Mock QR code generation (replace with actual QR library)
    const qrCode = `REXLO_PAYMENT_${paymentId}_${Buffer.from(JSON.stringify(qrData)).toString('base64')}`;

    res.json({
      success: true,
      paymentId,
      qrCode,
      amount,
      gameType,
      expiresAt: paymentSession.expiresAt,
      message: `QR code generated for $${amount} ${gameType} game entry`
    });

  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code'
    });
  }
});

// Process QR code payment
router.post('/process-payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const paymentSession = paymentSessions.get(paymentId);
    if (!paymentSession) {
      return res.status(404).json({
        success: false,
        error: 'Payment session not found or expired'
      });
    }

    // Check if expired
    if (new Date() > paymentSession.expiresAt) {
      paymentSessions.delete(paymentId);
      return res.status(400).json({
        success: false,
        error: 'Payment session expired'
      });
    }

    // Process payment (mock payment processing)
    const paymentSuccess = await processPayment(paymentMethod, paymentSession.amount, transactionId);

    if (paymentSuccess) {
      // Add funds to user wallet
      const wallet = await Wallet.findOne({ userId: paymentSession.userId });
      if (wallet) {
        await wallet.addTransaction({
          type: 'payment',
          amount: paymentSession.amount,
          description: `Payment for ${paymentSession.gameType} game entry`,
          status: 'completed',
          metadata: {
            paymentId,
            paymentMethod,
            transactionId
          }
        });

        await wallet.updateBalance(paymentSession.amount, 'payment');
        await wallet.save();

        // Update payment session
        paymentSession.status = 'completed';
        paymentSession.completedAt = new Date();
        paymentSession.transactionId = transactionId;
        paymentSessions.set(paymentId, paymentSession);

        res.json({
          success: true,
          message: `Payment of $${paymentSession.amount} processed successfully`,
          newBalance: wallet.balance,
          paymentId
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Payment processing failed'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment processing failed'
      });
    }

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    });
  }
});

// Check payment status
router.get('/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const paymentSession = paymentSessions.get(paymentId);
    if (!paymentSession) {
      return res.status(404).json({
        success: false,
        error: 'Payment session not found'
      });
    }

    // Check if user owns this payment
    if (paymentSession.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const timeRemaining = Math.max(0, paymentSession.expiresAt - new Date());
    const isExpired = timeRemaining === 0;

    res.json({
      success: true,
      paymentId,
      status: paymentSession.status,
      amount: paymentSession.amount,
      gameType: paymentSession.gameType,
      createdAt: paymentSession.createdAt,
      expiresAt: paymentSession.expiresAt,
      timeRemaining,
      isExpired,
      completedAt: paymentSession.completedAt,
      transactionId: paymentSession.transactionId
    });

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status'
    });
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    // Get user's payment sessions
    const userPayments = [];
    for (const [paymentId, session] of paymentSessions.entries()) {
      if (session.userId === userId) {
        userPayments.push({
          paymentId,
          amount: session.amount,
          gameType: session.gameType,
          status: session.status,
          createdAt: session.createdAt,
          completedAt: session.completedAt,
          transactionId: session.transactionId
        });
      }
    }

    // Also get wallet transactions for payments
    const wallet = await Wallet.findOne({ userId });
    const paymentTransactions = await Transaction.find({
      userId,
      type: 'payment'
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('userId', 'username');

    res.json({
      success: true,
      payments: userPayments,
      transactions: paymentTransactions,
      totalPages: Math.ceil(userPayments.length / limit),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment history'
    });
  }
});

// Mock payment processing function
async function processPayment(paymentMethod, amount, transactionId) {
  // In a real implementation, integrate with actual payment gateway
  // For now, simulating successful payment
  
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success (90% success rate for demo)
    return Math.random() > 0.1;
    
    // Real implementation would be:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount * 100, // Convert to cents
    //   currency: 'usd',
    //   payment_method: paymentMethod,
    //   metadata: { transaction_id: transactionId }
    // });
    // return paymentIntent.status === 'succeeded';
    
  } catch (error) {
    console.error('Payment processing error:', error);
    return false;
  }
}

// Cleanup expired payment sessions
router.post('/cleanup', async (req, res) => {
  try {
    const now = new Date();
    let cleanedCount = 0;

    for (const [paymentId, session] of paymentSessions.entries()) {
      if (now > session.expiresAt) {
        paymentSessions.delete(paymentId);
        cleanedCount++;
      }
    }

    res.json({
      success: true,
      cleanedCount,
      message: `Cleaned up ${cleanedCount} expired payment sessions`
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup payment sessions'
    });
  }
});

// Admin: Get all payment sessions
router.get('/admin/all-sessions', authenticate, async (req, res) => {
  try {
    // Admin check (you should replace with your actual admin check)
    if (req.user.email !== 'admin@rexlo.com') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { page = 1, limit = 50 } = req.query;
    const allSessions = Array.from(paymentSessions.entries()).map(([paymentId, session]) => ({
      paymentId,
      userId: session.userId,
      amount: session.amount,
      gameType: session.gameType,
      status: session.status,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      completedAt: session.completedAt,
      transactionId: session.transactionId
    }));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSessions = allSessions.slice(startIndex, endIndex);

    res.json({
      success: true,
      sessions: paginatedSessions,
      totalPages: Math.ceil(allSessions.length / limit),
      currentPage: parseInt(page),
      total: allSessions.length
    });

  } catch (error) {
    console.error('Admin sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment sessions'
    });
  }
});

module.exports = router;
