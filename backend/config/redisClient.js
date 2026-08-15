const { createClient } = require('redis');
const logger = require('../utils/logger');

let redisClient = null;
let isConnected = false;

// Fallback in-memory cache & lock store for local dev when Redis server is offline
const memoryStore = new Map();
const memoryLocks = new Set();

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  
  try {
    redisClient = createClient({ 
      url: redisUrl,
      socket: {
        reconnectStrategy: false
      }
    });

    redisClient.on('error', (err) => {
      if (isConnected) {
        logger.warn(`Redis connection warning: ${err.message}`);
      }
      isConnected = false;
    });

    redisClient.on('connect', () => {
      isConnected = true;
      logger.info('Connected to Redis Server');
    });

    await redisClient.connect();
  } catch (err) {
    isConnected = false;
    logger.warn(`Redis not available (${err.message}). Using fallback in-memory cache/locks.`);
  }
};

const getAsync = async (key) => {
  if (isConnected && redisClient) {
    try {
      return await redisClient.get(key);
    } catch (e) {
      logger.warn(`Redis GET failed for key ${key}: ${e.message}`);
    }
  }
  return memoryStore.get(key) || null;
};

const setExAsync = async (key, seconds, value) => {
  if (isConnected && redisClient) {
    try {
      await redisClient.setEx(key, seconds, value);
      return;
    } catch (e) {
      logger.warn(`Redis SETEX failed for key ${key}: ${e.message}`);
    }
  }
  memoryStore.set(key, value);
  setTimeout(() => memoryStore.delete(key), seconds * 1000);
};

const delAsync = async (key) => {
  if (isConnected && redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (e) {
      logger.warn(`Redis DEL failed for key ${key}: ${e.message}`);
    }
  }
  memoryStore.delete(key);
};

const acquireLock = async (lockKey, ttlSeconds = 30) => {
  if (isConnected && redisClient) {
    try {
      const result = await redisClient.set(lockKey, 'LOCKED', {
        NX: true,
        EX: ttlSeconds
      });
      return result === 'OK';
    } catch (e) {
      logger.warn(`Redis lock acquire failed: ${e.message}`);
    }
  }

  // In a multi-node production setup, falling back to memory locks breaks distributed locking.
  // We can enforce a strict failure mode here to prevent double-bookings.
  if (process.env.NODE_ENV === 'production' && process.env.STRICT_REDIS_LOCKS === 'true') {
    logger.error(`Redis is down. Rejecting lock request for ${lockKey} to prevent race conditions.`);
    return false;
  }

  // Memory fallback lock (safe for single-instance deployments)
  if (memoryLocks.has(lockKey)) {
    return false;
  }
  memoryLocks.add(lockKey);
  setTimeout(() => memoryLocks.delete(lockKey), ttlSeconds * 1000);
  return true;
};

const releaseLock = async (lockKey) => {
  if (isConnected && redisClient) {
    try {
      await redisClient.del(lockKey);
    } catch (e) {
      logger.warn(`Redis lock release failed: ${e.message}`);
    }
  }
  memoryLocks.delete(lockKey);
};

const closeRedis = async () => {
  if (isConnected && redisClient) {
    try {
      await redisClient.quit();
      isConnected = false;
      logger.info('Redis connection closed.');
    } catch (err) {
      logger.error(`Error closing Redis connection: ${err.message}`);
    }
  }
};

module.exports = {
  initRedis,
  getAsync,
  setExAsync,
  delAsync,
  acquireLock,
  releaseLock,
  isRedisConnected: () => isConnected,
  closeRedis,
  getRawClient: () => redisClient
};
