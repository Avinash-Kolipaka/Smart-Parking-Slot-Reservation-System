const AdminLog = require('../models/AdminLog');
const logger = require('../utils/logger');

const logAdminAction = async ({
  adminId,
  action,
  resource = null,
  resourceId = null,
  details = '',
  oldValue = null,
  newValue = null,
  req = null
}) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : '';
    const userAgent = req ? req.headers['user-agent'] : '';

    await AdminLog.create({
      adminId,
      action,
      resource,
      resourceId,
      details,
      oldValue,
      newValue,
      ipAddress,
      userAgent
    });
  } catch (error) {
    logger.error(`Failed to record Admin Log: ${error.message}`);
  }
};

module.exports = {
  logAdminAction
};
