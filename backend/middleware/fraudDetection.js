const { detectFraud } = require('../controllers/fraudDetection');

// Middleware to detect fraud on game moves
const fraudDetectionMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId || req.body.userId;
    
    if (!userId) {
      return next();
    }

    // Check for fraud based on reaction time if provided
    if (req.body.reactionTime) {
      const fraudResult = await detectFraud(userId, {
        reactionTime: req.body.reactionTime,
        activityType: 'game_move'
      });

      if (fraudResult.shouldFreeze) {
        return res.status(403).json({
          success: false,
          message: 'Account frozen due to suspicious activity',
          alerts: fraudResult.alerts
        });
      }

      // Attach fraud result to request for logging
      req.fraudResult = fraudResult;
    }

    next();
  } catch (error) {
    console.error('Fraud detection error:', error);
    next(); // Continue even if fraud detection fails
  }
};

module.exports = fraudDetectionMiddleware;
