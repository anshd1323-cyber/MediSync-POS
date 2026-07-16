// ============================================================
// Super Admin API
// ============================================================
import client from './client';

const ADMIN = '/api/admin';

export function getTenants(params = {}) {
  return client.get(`${ADMIN}/tenants`, { params });
}

export function getTenantById(id) {
  return client.get(`${ADMIN}/tenants/${id}`);
}

export function updateLicense(id, data) {
  // data: { plan, status, expiresAt }
  return client.patch(`${ADMIN}/tenants/${id}/license`, data);
}

export function getRevenue(params = {}) {
  return client.get(`${ADMIN}/revenue`, { params });
}

export function getFeatureFlags() {
  return client.get(`${ADMIN}/features`);
}

export function updateFeatureFlag(data) {
  // data: { plan, feature, enabled }
  return client.put(`${ADMIN}/features`, data);
}
