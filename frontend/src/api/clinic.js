// ============================================================
// Clinic Admin API
// ============================================================
import client from './client';

const CLINIC = '/api/clinic';

export function getDashboard() {
  return client.get(`${CLINIC}/dashboard`);
}

export function getStaff() {
  return client.get(`${CLINIC}/staff`);
}

export function addStaff(data) {
  // data: { name, email, password, role }
  return client.post(`${CLINIC}/staff`, data);
}

export function updateStaff(id, data) {
  return client.put(`${CLINIC}/staff/${id}`, data);
}

export function getSubscription() {
  return client.get(`${CLINIC}/subscription`);
}

export function getRevenueReport(params = {}) {
  return client.get(`${CLINIC}/revenue`, { params });
}
