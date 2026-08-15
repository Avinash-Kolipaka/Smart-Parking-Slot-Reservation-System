const { getDashboardOverview } = require('../services/analytics/analyticsService');

const getOverview = async (req, res, next) => {
  try {
    const data = await getDashboardOverview();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview
};
