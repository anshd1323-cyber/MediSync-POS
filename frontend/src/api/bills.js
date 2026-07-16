// ============================================================
// Bills API
// ============================================================
import client from './client';

const BILLS = '/api/bills';

export function createBill(data) {
  return client.post(BILLS, data);
}

export function getAllBills(params = {}) {
  return client.get(BILLS, { params });
}

export function getBillById(id) {
  return client.get(`${BILLS}/${id}`);
}

export function getReceipt(id) {
  return client.get(`${BILLS}/${id}/receipt`);
}

export function getDaySummary(date) {
  return client.get(`${BILLS}/day-summary`, { params: { date } });
}
