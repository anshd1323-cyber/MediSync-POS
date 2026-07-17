const { Tenant, License, User, DoctorProfile, FeatureFlag, Bill, Visit, Patient } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

/**
 * List all tenants with license info (Super Admin).
 */
async function listTenants({ page = 1, limit = 20, plan, status }) {
  const where = {};

  const licenseWhere = {};
  if (plan) licenseWhere.plan = plan;
  if (status) licenseWhere.status = status;

  const offset = (page - 1) * limit;
  const { rows, count } = await Tenant.findAndCountAll({
    where,
    include: [{
      model: License,
      as: 'license',
      where: Object.keys(licenseWhere).length ? licenseWhere : undefined,
    }],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
  });

  return {
    tenants: rows,
    total: count,
    page: parseInt(page, 10),
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Get a single tenant's detail (Super Admin).
 */
async function getTenantDetail(tenantId) {
  const tenant = await Tenant.findByPk(tenantId, {
    include: [{ model: License, as: 'license' }],
  });
  if (!tenant) throw new ApiError(404, 'Tenant not found');

  // Get staff count
  const staffCount = await User.count({ where: { tenantId } });

  // Get patient count
  const patientCount = await Patient.count({ where: { tenantId } });

  // Get total revenue (sum of all bills)
  const totalRevenue = await Bill.sum('total', { where: { tenantId } }) || 0;

  // Get staff list
  const staff = await User.findAll({
    where: { tenantId },
    attributes: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
  });

  return {
    tenant,
    stats: { staffCount, patientCount, totalRevenue },
    staff,
  };
}

/**
 * Update a tenant's license (plan, status).
 */
async function updateTenantLicense(tenantId, data, adminUserId) {
  const license = await License.findOne({ where: { tenantId } });
  if (!license) throw new ApiError(404, 'License not found for this tenant');

  const oldPlan = license.plan;
  const oldStatus = license.status;

  if (data.plan) license.plan = data.plan;
  if (data.status) license.status = data.status;
  if (data.renewalDate) license.renewalDate = data.renewalDate;
  if (data.trialEnd) license.trialEnd = data.trialEnd;

  await license.save();

  await auditService.log({
    tenantId,
    userId: adminUserId,
    action: 'UPDATE',
    entityType: 'license',
    entityId: license.id,
    details: { oldPlan, newPlan: license.plan, oldStatus, newStatus: license.status },
  });

  return license;
}

/**
 * Platform-wide revenue and stats (Super Admin).
 */
async function getPlatformStats() {
  const totalTenants = await Tenant.count();
  const activeTenants = await License.count({ where: { status: 'ACTIVE' } });
  const trialTenants = await License.count({ where: { status: 'TRIAL' } });
  const expiredTenants = await License.count({ where: { status: 'EXPIRED' } });
  const suspendedTenants = await License.count({ where: { status: 'SUSPENDED' } });

  // Plan distribution
  const planDistribution = {
    FREE: await License.count({ where: { plan: 'FREE' } }),
    STARTER: await License.count({ where: { plan: 'STARTER' } }),
    PRO: await License.count({ where: { plan: 'PRO' } }),
    ENTERPRISE: await License.count({ where: { plan: 'ENTERPRISE' } }),
  };

  return {
    totalTenants,
    activeTenants,
    trialTenants,
    expiredTenants,
    suspendedTenants,
    planDistribution,
  };
}

/**
 * Get all feature flags.
 */
async function getFeatureFlags() {
  return FeatureFlag.findAll({
    order: [['plan', 'ASC'], ['featureKey', 'ASC']],
  });
}

/**
 * Update a feature flag.
 */
async function updateFeatureFlag(id, { enabled }) {
  const flag = await FeatureFlag.findByPk(id);
  if (!flag) throw new ApiError(404, 'Feature flag not found');
  flag.enabled = enabled;
  await flag.save();
  return flag;
}

/**
 * Create or update a feature flag.
 */
async function upsertFeatureFlag({ plan, featureKey, enabled }) {
  const [flag, created] = await FeatureFlag.findOrCreate({
    where: { plan, featureKey },
    defaults: { enabled: enabled !== undefined ? enabled : true },
  });
  if (!created) {
    flag.enabled = enabled !== undefined ? enabled : flag.enabled;
    await flag.save();
  }
  return { flag, created };
}

module.exports = {
  listTenants,
  getTenantDetail,
  updateTenantLicense,
  getPlatformStats,
  getFeatureFlags,
  updateFeatureFlag,
  upsertFeatureFlag,
};
