require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { initRedis, closeRedis } = require('./config/redisClient');
const { initEmitter } = require('./config/socket');
const initCronJobs = require('./jobs/cronJobs');
const logger = require('./utils/logger');

const startWorker = async () => {
  try {
    logger.info('Starting ParkOps Background Worker...');
    await connectDB();
    await initRedis();
    initEmitter();
    initCronJobs();
    logger.info('ParkOps Background Worker started successfully.');
  } catch (err) {
    logger.error(`Worker startup failure: ${err.message}`);
    process.exit(1);
  }
};

startWorker();

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection Error in Worker: ${err.message}`);
});

// Graceful Shutdown
const shutdown = async () => {
  logger.info('Graceful shutdown initiated in Worker...');
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
    await closeRedis();
    process.exit(0);
  } catch (err) {
    logger.error('Error during worker shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
