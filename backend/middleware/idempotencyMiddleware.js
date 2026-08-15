const { getAsync, setExAsync } = require('../config/redisClient');
const logger = require('../utils/logger');

const checkIdempotency = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
      return next();
    }

    const redisKey = `idempotency:${idempotencyKey}`;

    try {
      const cachedResponse = await getAsync(redisKey);
      if (cachedResponse) {
        logger.info(`Idempotency key match found for ${idempotencyKey}. Returning cached response.`);
        const { status, body } = JSON.parse(cachedResponse);
        return res.status(status).json(body);
      }

      // Intercept res.json to cache response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setExAsync(redisKey, ttlSeconds, JSON.stringify({
            status: res.statusCode,
            body
          })).catch(err => logger.error(`Failed to store idempotency key: ${err.message}`));
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      logger.error(`Idempotency middleware error: ${err.message}`);
      next();
    }
  };
};

module.exports = { checkIdempotency };
