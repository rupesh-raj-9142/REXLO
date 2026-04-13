const Razorpay = require('razorpay');
const { processTransaction } = require('./walletController');

// Initialize Razorpay with error handling
let razorpay = null;

const initRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️  Razorpay keys not configured. Payment features will be disabled.');
    return null;
  }
  
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay initialized successfully');
    return razorpay;
  } catch (error) {
    console.error('❌ Razorpay initialization failed:', error.message);
    return null;
  }
};

// Initialize on module load
initRazorpay();

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please contact administrator.'
      });
    }

    const {
      orderCreationId,
      razorpayPaymentId,
      razorpaySignature,
      amount,
      userId
    } = req.body;

    const crypto = require('crypto');

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Payment verified, add to wallet
    const result = await processTransaction(
      userId,
      'deposit',
      amount,
      'Deposit via Razorpay',
      {
        paymentId: razorpayPaymentId,
        paymentGateway: 'razorpay',
        orderId: orderCreationId
      }
    );

    res.json({
      success: true,
      message: 'Payment verified and added to wallet',
      newBalance: result.newBalance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please contact administrator.'
      });
    }

    const { amount, userId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId: userId
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Withdraw money
const withdrawMoney = async (req, res) => {
  try {
    const { userId, amount, upiId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Process withdrawal transaction
    const result = await processTransaction(
      userId,
      'withdraw',
      amount,
      `Withdrawal to UPI: ${upiId}`,
      {
        upiId,
        paymentGateway: 'upi'
      }
    );

    // In production, you would initiate actual UPI transfer here
    // For now, we'll mark as pending manual review

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      newBalance: result.newBalance,
      transaction: result.transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  withdrawMoney,
  initRazorpay
};