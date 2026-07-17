const { Visit, Patient, User, DoctorProfile, Prescription } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

/**
 * Get the next token number for today in a clinic.
 */
async function getNextToken(tenantId, date) {
  const today = date || new Date().toISOString().split('T')[0];
  const maxToken = await Visit.max('tokenNo', {
    where: { tenantId, visitDate: today },
  });
  return (maxToken || 0) + 1;
}

/**
 * Create a new visit (register patient walk-in / appointment).
 */
async function createVisit(tenantId, { patientId, doctorId }, userId) {
  // Validate patient belongs to tenant
  const patient = await Patient.findOne({ where: { id: patientId, tenantId } });
  if (!patient) throw new ApiError(404, 'Patient not found in your clinic');

  // Validate doctor belongs to tenant
  const doctor = await User.findOne({ where: { id: doctorId, tenantId, role: 'DOCTOR' } });
  if (!doctor) throw new ApiError(404, 'Doctor not found in your clinic');

  const today = new Date().toISOString().split('T')[0];
  const tokenNo = await getNextToken(tenantId, today);

  const visit = await Visit.create({
    tenantId,
    patientId,
    doctorId,
    tokenNo,
    status: 'WAITING',
    visitDate: today,
    vitals: {},
  });

  await auditService.log({
    tenantId,
    userId,
    action: 'CREATE',
    entityType: 'visit',
    entityId: visit.id,
    details: { patientId, doctorId, tokenNo },
  });

  // Return visit with associations
  return Visit.findByPk(visit.id, {
    include: [
      { model: Patient, as: 'patient' },
      { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] },
    ],
  });
}

/**
 * Get today's visits for a clinic (queue board).
 */
async function getTodayVisits(tenantId) {
  const today = new Date().toISOString().split('T')[0];
  return Visit.findAll({
    where: { tenantId, visitDate: today },
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'phone'] },
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
    ],
    order: [['tokenNo', 'ASC']],
  });
}

/**
 * Get a doctor's queue for today.
 */
async function getDoctorQueue(tenantId, doctorId) {
  const today = new Date().toISOString().split('T')[0];
  return Visit.findAll({
    where: { tenantId, doctorId, visitDate: today },
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'phone', 'dateOfBirth', 'gender', 'bloodGroup'] },
    ],
    order: [['tokenNo', 'ASC']],
  });
}

/**
 * Get visit by ID (tenant-scoped).
 */
async function getVisitById(tenantId, visitId) {
  const visit = await Visit.findOne({
    where: { id: visitId, tenantId },
    include: [
      { model: Patient, as: 'patient' },
      { model: User, as: 'doctor', attributes: ['id', 'name', 'email'],
        include: [{ model: DoctorProfile, as: 'doctorProfile' }] },
      { model: Prescription, as: 'prescription' },
    ],
  });
  if (!visit) throw new ApiError(404, 'Visit not found');
  return visit;
}

/**
 * Update visit status (WAITING -> IN_CONSULTATION -> COMPLETED).
 */
async function updateVisitStatus(tenantId, visitId, status, userId) {
  const visit = await Visit.findOne({ where: { id: visitId, tenantId } });
  if (!visit) throw new ApiError(404, 'Visit not found');

  if (visit.status === 'COMPLETED') {
    throw new ApiError(400, 'Completed visits cannot be modified');
  }
  if (visit.status === 'CANCELLED') {
    throw new ApiError(400, 'Cancelled visits cannot be modified');
  }

  const oldStatus = visit.status;
  visit.status = status;
  await visit.save();

  await auditService.log({
    tenantId,
    userId,
    action: 'UPDATE',
    entityType: 'visit',
    entityId: visit.id,
    details: { oldStatus, newStatus: status },
  });

  return visit;
}

/**
 * Update vitals for a visit.
 */
async function updateVitals(tenantId, visitId, vitals, userId) {
  const visit = await Visit.findOne({ where: { id: visitId, tenantId } });
  if (!visit) throw new ApiError(404, 'Visit not found');

  visit.vitals = vitals;
  await visit.save();

  return visit;
}

/**
 * Update clinical notes and diagnosis for a visit.
 */
async function updateNotes(tenantId, visitId, { notes, diagnosis }, userId) {
  const visit = await Visit.findOne({ where: { id: visitId, tenantId } });
  if (!visit) throw new ApiError(404, 'Visit not found');

  if (notes !== undefined) visit.notes = notes;
  if (diagnosis !== undefined) visit.diagnosis = diagnosis;
  await visit.save();

  return visit;
}

/**
 * Get a patient's visit history.
 */
async function getPatientVisitHistory(tenantId, patientId) {
  return Visit.findAll({
    where: { tenantId, patientId },
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Prescription, as: 'prescription' },
    ],
    order: [['createdAt', 'DESC']],
  });
}

module.exports = {
  createVisit,
  getTodayVisits,
  getDoctorQueue,
  getVisitById,
  updateVisitStatus,
  updateVitals,
  updateNotes,
  getPatientVisitHistory,
};
