const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');
const TenantMembership = require('../models/TenantMembership');

/**
 * Resolves the tenant from headers and verifies the authenticated user has membership.
 * If x-tenant-id is omitted, it allows the request to proceed as public/single-tenant.
 */
const resolveTenant = async (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    return next();
  }

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (tenant.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Tenant is suspended' });
    }

    // Try resolving user from req.user or Authorization header
    let userId = req.user ? (req.user._id || req.user.id) : null;
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // Token error handled downstream if needed
      }
    }

    if (userId) {
      const membership = await TenantMembership.findOne({
        userId,
        tenantId: tenant._id,
        status: 'ACTIVE'
      });

      if (!membership) {
        return res.status(403).json({ success: false, message: 'User is not a member of this tenant' });
      }

      req.membership = membership;
    }

    // Attach to request
    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  resolveTenant
};
