const { License, FeatureFlag } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Feature gate middleware factory.
 * Checks if the tenant's current plan includes the specified feature.
 * Must be placed AFTER authenticate + attachTenant middleware.
 *
 * @param {string} featureKey - The feature key to check (e.g., 'billing_pos', 'pharmacy_module')
 */
const requireFeature = (featureKey) => async (req, res, next) => {
  try {
    // Super Admin bypasses all feature gates
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!req.tenantId) {
      throw new ApiError(403, 'No clinic context available');
    }

    const license = await License.findOne({ where: { tenantId: req.tenantId } });

    if (!license) {
      throw new ApiError(403, 'No active subscription found for your clinic');
    }

    if (license.status === 'EXPIRED' || license.status === 'SUSPENDED') {
      throw new ApiError(403, 'Your clinic subscription is not active. Please contact support.');
    }

    const flag = await FeatureFlag.findOne({
      where: {
        plan: license.plan,
        featureKey: featureKey,
        enabled: true,
      },
    });

    if (!flag) {
      throw new ApiError(403, JSON.stringify({
        code: 'FEATURE_LOCKED',
        feature: featureKey,
        currentPlan: license.plan,
        message: `This feature requires an upgraded plan. Your current plan: ${license.plan}`,
      }));
    }

    // Attach license info to request for downstream use
    req.license = license;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireFeature;
