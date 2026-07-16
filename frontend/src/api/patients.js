// ============================================================
// Patients API
// ============================================================
import client from './client';

const PATIENTS = '/api/patients';

export function searchPatients(query, page = 1, limit = 10) {
  return client.get(PATIENTS, { params: { q: query, page, limit } });
}

export function createPatient(data) {
  return client.post(PATIENTS, data);
}

export function getPatientById(id) {
  return client.get(`${PATIENTS}/${id}`);
}

export function updatePatient(id, data) {
  return client.put(`${PATIENTS}/${id}`, data);
}
