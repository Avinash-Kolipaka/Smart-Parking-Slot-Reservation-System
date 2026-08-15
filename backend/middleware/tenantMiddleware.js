const Tenant = require('../models/Tenant');
const TenantMembership = require('../models/TenantMembership');

/**
 * Resolves the tenant from headers and verifies the authenticated user has membership.
 * Expects `req.user` to be populated by `protect` middleware first.
 */
const resolveTenant = async (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    return res.status(400).json({ success: false, message: 'X-Tenant-Id header is required' });
  }

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (tenant.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Tenant is suspended' });
    }

    // Verify user membership
    const membership = await TenantMembership.findOne({
      userId: req.user._id,
      tenantId: tenant._id,
      status: 'ACTIVE'
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'User is not a member of this tenant' });
    }

    // Attach to request
    req.tenant = tenant;
    req.membership = membership;
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  resolveTenant
};
