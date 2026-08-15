const rolePermissions = {
  TENANT_OWNER: ['*'],
  TENANT_ADMIN: [
    'parking.read', 'parking.manage', 'slot.read', 'slot.manage',
    'booking.read', 'booking.manage', 'payment.read', 'payment.manage',
    'analytics.read', 'reports.generate', 'users.read', 'users.manage',
    'settings.manage', 'billing.manage'
  ],
  PARKING_MANAGER: [
    'parking.read', 'parking.manage', 'slot.read', 'slot.manage',
    'booking.read', 'booking.manage', 'analytics.read'
  ],
  FINANCE_MANAGER: [
    'payment.read', 'payment.refund', 'analytics.read', 'reports.generate'
  ],
  PARKING_OPERATOR: [
    'slot.read', 'booking.read'
  ],
  SECURITY_OPERATOR: [
    'booking.read', 'booking.verify_qr'
  ],
  STAFF: [
    'booking.read'
  ]
};

/**
 * Fine-grained permission check based on the user's active TenantMembership role.
 * Expects `req.membership` to be populated by `resolveTenant`.
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.membership) {
      return res.status(403).json({ success: false, message: 'No active tenant membership found' });
    }

    const userRole = req.membership.role;
    const permissions = rolePermissions[userRole] || [];

    // Grant all if '*'
    if (permissions.includes('*') || permissions.includes(permission)) {
      return next();
    }

    // Check granular permission overrides on the membership (optional enhancement)
    if (req.membership.permissions && req.membership.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: `Role ${userRole} lacks required permission: ${permission}` 
    });
  };
};

module.exports = {
  requirePermission
};
