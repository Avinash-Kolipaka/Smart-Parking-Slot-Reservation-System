const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

/**
 * Authenticates incoming third-party requests using an API Key.
 * Checks scopes (e.g. 'parking:read').
 */
const requireApiKey = (requiredScope) => {
  return async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'API Key missing' });
    }

    try {
      // Typically keys have a prefix and secret. For simplicity, we hash the provided key to match the DB.
      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

      const apiKeyDoc = await ApiKey.findOne({ keyHash }).populate('tenantId');

      if (!apiKeyDoc || apiKeyDoc.revoked) {
        return res.status(401).json({ success: false, message: 'Invalid or revoked API Key' });
      }

      if (apiKeyDoc.expiresAt && apiKeyDoc.expiresAt < new Date()) {
        return res.status(401).json({ success: false, message: 'API Key expired' });
      }

      // Check scope
      if (requiredScope && !apiKeyDoc.scopes.includes(requiredScope) && !apiKeyDoc.scopes.includes('*')) {
        return res.status(403).json({ success: false, message: `Missing required API scope: ${requiredScope}` });
      }

      // Update last used asynchronously
      ApiKey.updateOne({ _id: apiKeyDoc._id }, { lastUsedAt: new Date() }).exec();

      req.tenant = apiKeyDoc.tenantId; // Attach tenant context for the controller
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireApiKey
};
