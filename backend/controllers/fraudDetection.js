const User = require('../models/User');
const Match = require('../models/Match');

// Store reaction times for each user
const userReactionTimes = new Map(); // userId -> [reactionTimes]

// Track suspicious activity
const suspiciousActivities = new Map(); // userId -> { count, lastActivity }

// Analyze reaction time for bot detection
const analyzeReactionTime = (userId, reactionTime) => {
  if (!userReactionTimes.has(userId)) {
    userReactionTimes.set(userId, []);
  }

  const times = userReactionTimes.get(userId);
  times.push(reactionTime);

  // Keep only last 20 reaction times
  if (times.length > 20) {
    times.shift();
  }

  // Calculate statistics
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const stdDev = Math.sqrt(
    times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length
  );

  // Bot detection rules
  const isSuspicious = 
    minTime < 50 || // Too fast (human reaction time is typically 150-300ms)
    stdDev < 20 || // Too consistent (bots have very consistent reaction times)
    (times.length >= 10 && times.every(t => t < 100)); // All times under 100ms

  return {
    isSuspicious,
    avgTime,
    minTime,
    maxTime,
    stdDev,
    sampleSize: times.length
  };
};

// Detect unusual patterns
const detectUnusualPatterns = (userId, activityType) => {
  const key = `${userId}_${activityType}`;
  
  if (!suspiciousActivities.has(key)) {
    suspiciousActivities.set(key, { count: 0, lastActivity: Date.now() });
  }

  const activity = suspiciousActivities.get(key);
  const timeSinceLastActivity = Date.now() - activity.lastActivity;

  // Reset count if too much time has passed
  if (timeSinceLastActivity > 60000) { // 1 minute
    activity.count = 0;
  }

  activity.count++;
  activity.lastActivity = Date.now();

  // Flag if too many activities in short time
  const isSuspicious = activity.count > 30; // More than 30 actions per minute

  return {
    isSuspicious,
    count: activity.count,
    timeSinceLastActivity
  };
};

// Check for win rate anomalies
const checkWinRateAnomaly = async (userId) => {
  try {
    const matches = await Match.find({
      'players.userId': userId,
      status: 'completed'
    }).limit(50);

    if (matches.length < 10) {
      return { isSuspicious: false, message: 'Not enough data' };
    }

    const wins = matches.filter(m => m.winnerId?.toString() === userId).length;
    const winRate = wins / matches.length;

    // Flag if win rate is suspiciously high (>90% over 50+ games)
    const isSuspicious = winRate > 0.9 && matches.length >= 50;

    return {
      isSuspicious,
      winRate: (winRate * 100).toFixed(2),
      totalMatches: matches.length,
      wins,
      losses: matches.length - wins
    };
  } catch (error) {
    console.error('Error checking win rate:', error);
    return { isSuspicious: false, error: error.message };
  }
};

// Freeze user account if fraud detected
const freezeAccount = async (userId, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isFrozen = true;
    user.freezeReason = reason;
    await user.save();

    console.log(`Account frozen: ${userId} - Reason: ${reason}`);
    return { success: true, message: 'Account frozen due to suspicious activity' };
  } catch (error) {
    console.error('Error freezing account:', error);
    return { success: false, error: error.message };
  }
};

// Main fraud detection function
const detectFraud = async (userId, activityData) => {
  const alerts = [];

  // Check reaction time
  if (activityData.reactionTime) {
    const reactionAnalysis = analyzeReactionTime(userId, activityData.reactionTime);
    if (reactionAnalysis.isSuspicious) {
      alerts.push({
        type: 'reaction_time',
        severity: 'high',
        data: reactionAnalysis,
        message: 'Suspicious reaction time detected (possible bot)'
      });
    }
  }

  // Check activity patterns
  if (activityData.activityType) {
    const patternAnalysis = detectUnusualPatterns(userId, activityData.activityType);
    if (patternAnalysis.isSuspicious) {
      alerts.push({
        type: 'activity_pattern',
        severity: 'medium',
        data: patternAnalysis,
        message: 'Unusual activity pattern detected'
      });
    }
  }

  // Check win rate (only for completed games)
  if (activityData.checkWinRate) {
    const winRateAnalysis = await checkWinRateAnomaly(userId);
    if (winRateAnalysis.isSuspicious) {
      alerts.push({
        type: 'win_rate',
        severity: 'high',
        data: winRateAnalysis,
        message: 'Suspiciously high win rate detected'
      });
    }
  }

  // Auto-freeze if multiple high-severity alerts
  const highSeverityAlerts = alerts.filter(a => a.severity === 'high');
  if (highSeverityAlerts.length >= 2) {
    await freezeAccount(userId, 'Multiple fraud alerts triggered');
  }

  return {
    hasAlerts: alerts.length > 0,
    alerts,
    shouldFreeze: highSeverityAlerts.length >= 2
  };
};

// Log game move for reaction time analysis
const logGameMove = (userId, moveTimestamp) => {
  const reactionTime = moveTimestamp; // Time since last move or game start
  return analyzeReactionTime(userId, reactionTime);
};

// Reset user data (for testing or after manual review)
const resetUserData = (userId) => {
  userReactionTimes.delete(userId);
  // Remove all suspicious activities for this user
  for (const [key] of suspiciousActivities) {
    if (key.startsWith(userId + '_')) {
      suspiciousActivities.delete(key);
    }
  }
};

module.exports = {
  detectFraud,
  logGameMove,
  analyzeReactionTime,
  detectUnusualPatterns,
  checkWinRateAnomaly,
  freezeAccount,
  resetUserData
};
