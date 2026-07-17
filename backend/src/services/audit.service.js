const { AuditLog } = require('../models');

/**
 * Log an auditable action.
 * @param {Object} params
 * @param {number} params.tenantId
 * @param {number} params.userId
 * @param {string} params.action - CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
 * @param {string} params.entityType - patient, visit, bill, prescription, license, user
 * @param {number} [params.entityId]
 * @param {Object} [params.details]
 * @param {string} [params.ipAddress]
 */
async function log({ tenantId, userId, action, entityType, entityId, details, ipAddress }) {
  try {
    await AuditLog.create({
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      details: details || {},
      ipAddress,
    });
  } catch (err) {
    // Audit logging should never break the main flow
    console.error('Audit log error:', err.message);
  }
}

module.exports = { log };
