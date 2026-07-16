// ============================================================
// Auth API
// ============================================================
import client from './client';

const AUTH = '/api/auth';

export function login(email, password) {
  return client.post(`${AUTH}/login`, { email, password });
}

export function signupClinic(data) {
  // data: { clinicName, address, phone, ownerName, email, password }
  return client.post(`${AUTH}/signup`, data);
}

export function refreshToken() {
  return client.post(`${AUTH}/refresh`);
}

export function logout() {
  return client.post(`${AUTH}/logout`);
}

export function getProfile() {
  return client.get(`${AUTH}/profile`);
}

export function inviteStaff(data) {
  // data: { name, email, password, role }
  return client.post(`${AUTH}/invite`, data);
}
