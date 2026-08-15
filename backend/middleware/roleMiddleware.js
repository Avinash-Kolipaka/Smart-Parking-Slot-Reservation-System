const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedRoles = roles.map(r => r.toUpperCase());

    // Allow SUPER_ADMIN by default for administrative endpoints
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    // Compare normalized user role against permitted roles
    const isAuthorized = normalizedRoles.includes(userRole);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`,
        errorCode: 'FORBIDDEN'
      });
    }

    next();
  };
};

module.exports = { authorize };
