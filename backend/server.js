require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { initRedis, isRedisConnected, closeRedis } = require('./config/redisClient');
const { initSocket } = require('./config/socket');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const requestIdMiddleware = require('./middleware/requestId');
const { metricsMiddleware } = require('./middleware/metrics');

// Route imports
const authRoutes = require('./routes/authRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Initialize app
const app = express();
const server = http.createServer(app);

// ---------------------------------------------------------------------------
// CORS — must be registered BEFORE routes so OPTIONS preflight is handled.
// Allowed origins: both localhost dev ports + production Vercel URL.
// CLIENT_URL / FRONTEND_URL both supported so existing .env files keep working.
// ---------------------------------------------------------------------------
const allowedOrigins = [
  'http://localhost:3000',  // Vite dev server (vite.config.js port)
  'http://localhost:5173',  // Vite default port
  'http://localhost:5000',  // Backend itself (for local curl / health checks)
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean).map(o => o.replace(/\/$/, '')); // strip trailing slash

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server / curl requests (no origin header)
    if (!origin) {
      return callback(null, true);
    }
    // Normalize incoming origin (strip trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    logger.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error(`CORS policy: origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID']
};

app.use(cors(corsOptions));

// Explicitly respond to all OPTIONS preflight requests so CORS headers
// are returned before any auth middleware can block the request.
app.options('*', cors(corsOptions));

// Security Middleware
app.use(helmet());

// Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// SRE & Observability Middlewares
app.use(requestIdMiddleware);
app.use(metricsMiddleware);

// Basic liveness endpoint (does the process run?)
app.get('/api/health/live', (req, res) => {
  res.status(200).json({ status: 'live', uptime: Math.floor(process.uptime()) });
});

// Deep readiness endpoint (can we serve traffic?)
app.get('/api/health/ready', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const redisConnected = isRedisConnected();

  if (!dbConnected) {
    return res.status(503).json({ status: 'unhealthy', reason: 'Database disconnected' });
  }

  res.status(200).json({
    success: true,
    status: 'ready',
    database: 'connected',
    redis: redisConnected ? 'connected' : 'memory_fallback',
    timestamp: new Date().toISOString()
  });
});

// Legacy health check (retained for backward compatibility with older tools)
app.get('/api/health', (req, res) => {
  res.redirect('/api/health/ready');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin/ai', aiRoutes);

// Root route – confirms the API is live (useful for Render / load-balancer checks)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Parking System API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Page Not Found route
app.use(notFound);

// Global Error Handler Middleware
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await initRedis();
  initSocket(server);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer().catch((err) => {
  logger.error(`Server startup failure: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection Error: ${err.message}`);
  // In production, we should gracefully shutdown on unhandled rejection
  // because the app might be in an inconsistent state.
  if (process.env.NODE_ENV === 'production') {
    shutdown();
  }
});

// Graceful Shutdown
const shutdown = () => {
  logger.info('Graceful shutdown initiated...');
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      await closeRedis();
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Force shutting down after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { app, server };
