// ============================================================
// Prescriptions API
// ============================================================
import client from './client';

const RX = '/api/prescriptions';

export function createPrescription(data) {
  return client.post(RX, data);
}

export function getPrescriptionById(id) {
  return client.get(`${RX}/${id}`);
}

export function getPrescriptionByVisit(visitId) {
  return client.get(`${RX}/visit/${visitId}`);
}

export function updatePrescription(id, data) {
  return client.put(`${RX}/${id}`, data);
}
