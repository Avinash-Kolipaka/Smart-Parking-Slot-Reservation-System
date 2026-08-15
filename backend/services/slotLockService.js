const { acquireLock, releaseLock } = require('../config/redisClient');
const logger = require('../utils/logger');

/**
 * Acquire temporary lock for slot booking to prevent concurrent double-bookings
 */
const lockSlotForBooking = async (slotId, startTime, endTime, ttlSeconds = 45) => {
  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();
  const lockKey = `slot-lock:${slotId}:${startMs}-${endMs}`;

  const success = await acquireLock(lockKey, ttlSeconds);
  if (!success) {
    logger.warn(`Failed to acquire lock for slot ${slotId} [${startTime} -> ${endTime}]`);
    return null;
  }
  return lockKey;
};

const releaseSlotLock = async (lockKey) => {
  if (lockKey) {
    await releaseLock(lockKey);
  }
};

module.exports = {
  lockSlotForBooking,
  releaseSlotLock
};
