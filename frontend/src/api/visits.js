// ============================================================
// Visits API
// ============================================================
import client from './client';

const VISITS = '/api/visits';

export function createVisit(data) {
  // data: { patientId, doctorId, type }
  return client.post(VISITS, data);
}

export function getTodayVisits() {
  return client.get(`${VISITS}/today`);
}

export function getQueue() {
  return client.get(`${VISITS}/queue`);
}

export function getVisitById(id) {
  return client.get(`${VISITS}/${id}`);
}

export function updateVisitStatus(id, status) {
  return client.patch(`${VISITS}/${id}/status`, { status });
}

export function updateVitals(id, vitals) {
  return client.patch(`${VISITS}/${id}/vitals`, vitals);
}

export function updateNotes(id, notes) {
  return client.patch(`${VISITS}/${id}/notes`, notes);
}

export function getPatientHistory(patientId) {
  return client.get(`${VISITS}/patient/${patientId}/history`);
}
