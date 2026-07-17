const { Prescription, Visit, Patient, User } = require('../models');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

/**
 * Create a new prescription.
 */
async function createPrescription(tenantId, data, userId) {
  // Validate visit
  const visit = await Visit.findOne({ where: { id: data.visitId, tenantId } });
  if (!visit) throw new ApiError(404, 'Visit not found');

  // Validate patient
  const patient = await Patient.findOne({ where: { id: data.patientId, tenantId } });
  if (!patient) throw new ApiError(404, 'Patient not found');

  // Check if prescription already exists for this visit
  const existing = await Prescription.findOne({ where: { visitId: data.visitId, tenantId } });
  if (existing) {
    throw new ApiError(409, 'A prescription already exists for this visit. Use update instead.');
  }

  const prescription = await Prescription.create({
    tenantId,
    visitId: data.visitId,
    doctorId: userId,
    patientId: data.patientId,
    medicines: data.medicines,
    notes: data.notes || null,
  });

  await auditService.log({
    tenantId,
    userId,
    action: 'CREATE',
    entityType: 'prescription',
    entityId: prescription.id,
    details: { visitId: data.visitId, medicineCount: data.medicines.length },
  });

  return Prescription.findByPk(prescription.id, {
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'phone', 'dateOfBirth', 'gender'] },
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Visit, as: 'visit' },
    ],
  });
}

/**
 * Get prescription by ID.
 */
async function getPrescriptionById(tenantId, prescriptionId) {
  const prescription = await Prescription.findOne({
    where: { id: prescriptionId, tenantId },
    include: [
      { model: Patient, as: 'patient' },
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Visit, as: 'visit' },
    ],
  });
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  return prescription;
}

/**
 * Get prescription by visit ID.
 */
async function getPrescriptionByVisit(tenantId, visitId) {
  const prescription = await Prescription.findOne({
    where: { visitId, tenantId },
    include: [
      { model: Patient, as: 'patient' },
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
    ],
  });
  return prescription; // Can be null if no prescription yet
}

/**
 * Update a prescription.
 */
async function updatePrescription(tenantId, prescriptionId, data, userId) {
  const prescription = await Prescription.findOne({
    where: { id: prescriptionId, tenantId },
  });
  if (!prescription) throw new ApiError(404, 'Prescription not found');

  if (prescription.doctorId !== userId) {
    throw new ApiError(403, 'Only the prescribing doctor can update this prescription');
  }

  if (data.medicines !== undefined) prescription.medicines = data.medicines;
  if (data.notes !== undefined) prescription.notes = data.notes;
  await prescription.save();

  await auditService.log({
    tenantId,
    userId,
    action: 'UPDATE',
    entityType: 'prescription',
    entityId: prescription.id,
  });

  return Prescription.findByPk(prescription.id, {
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'phone'] },
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Visit, as: 'visit' },
    ],
  });
}

module.exports = { createPrescription, getPrescriptionById, getPrescriptionByVisit, updatePrescription };
