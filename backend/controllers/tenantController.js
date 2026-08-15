const { createTenant, getUserTenants } = require('../services/saas/tenantService');
const Tenant = require('../models/Tenant');

const registerTenant = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const userId = req.user._id;

    const existing = await Tenant.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug already taken' });
    }

    const tenant = await createTenant(userId, { name, slug });
    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};

const getMyTenants = async (req, res, next) => {
  try {
    const tenants = await getUserTenants(req.user._id);
    res.status(200).json({ success: true, data: tenants });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerTenant,
  getMyTenants
};
