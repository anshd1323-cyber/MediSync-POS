const ApiError = require('../utils/ApiError');

/**
 * Tenant scoping middleware.
 * For non-SUPER_ADMIN users, enforces that tenantId is set from their JWT.
 * For SUPER_ADMIN, allows optional tenantId override via query parameter.
 * Must be placed AFTER authenticate middleware.
 */
const attachTenant = async (req, res, next) => {
  try {
    if (req.user.role === 'SUPER_ADMIN') {
      // Super Admin can optionally scope to a specific tenant
      if (req.query.tenantId) {
        req.tenantId = parseInt(req.query.tenantId, 10);
      }
      // tenantId remains null for cross-tenant operations
    } else {
      if (!req.user.tenantId) {
        throw new ApiError(403, 'User is not associated with any clinic');
      }
      req.tenantId = req.user.tenantId;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = attachTenant;
