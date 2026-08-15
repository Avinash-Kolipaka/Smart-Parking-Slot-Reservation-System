const logger = require('../utils/logger');

// Simple in-memory metrics for CloudWatch dashboards or logs
const metrics = {
  requests: {
    total: 0,
    errors: 0,
    durations: []
  },
  bookings: {
    created: 0,
    failed: 0
  }
};

const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();
  metrics.requests.total++;

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3) + (diff[1] * 1e-6);
    
    metrics.requests.durations.push(durationMs);
    // Keep only last 1000 to prevent memory leak
    if (metrics.requests.durations.length > 1000) metrics.requests.durations.shift();

    if (res.statusCode >= 400) {
      metrics.requests.errors++;
    }

    // Log the request structured data
    logger.info('HTTP Request', {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),
      userId: req.user ? req.user.id : null,
      ip: req.ip
    });
  });

  next();
};

const getMetrics = () => {
  const durs = metrics.requests.durations;
  const avgDuration = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : 0;
  
  return {
    ...metrics,
    requests: {
      ...metrics.requests,
      averageDurationMs: Math.round(avgDuration)
    }
  };
};

const recordBookingMetric = (success) => {
  if (success) {
    metrics.bookings.created++;
  } else {
    metrics.bookings.failed++;
  }
};

module.exports = {
  metricsMiddleware,
  getMetrics,
  recordBookingMetric
};
