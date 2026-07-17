const { Patient } = require('../models');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

/**
 * Search patients by name or phone within a tenant.
 */
async function searchPatients(tenantId, { query, page = 1, limit = 20 }) {
  const where = { tenantId };

  if (query) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query}%` } },
      { phone: { [Op.like]: `%${query}%` } },
    ];
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await Patient.findAndCountAll({
    where,
    limit: parseInt(limit, 10),
    offset,
    order: [['name', 'ASC']],
  });

  return {
    patients: rows,
    total: count,
    page: parseInt(page, 10),
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Register a new patient.
 */
async function createPatient(tenantId, data, userId) {
  // Check if phone already exists for this tenant
  const existing = await Patient.findOne({
    where: { tenantId, phone: data.phone },
  });
  if (existing) {
    throw new ApiError(409, 'A patient with this phone number already exists in your clinic');
  }

  const patient = await Patient.create({
    tenantId,
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    dateOfBirth: data.dateOfBirth || null,
    gender: data.gender || null,
    address: data.address || null,
    bloodGroup: data.bloodGroup || null,
    emergencyContact: data.emergencyContact || null,
    medicalHistory: data.medicalHistory || {},
  });

  await auditService.log({
    tenantId,
    userId,
    action: 'CREATE',
    entityType: 'patient',
    entityId: patient.id,
    details: { name: data.name, phone: data.phone },
  });

  return patient;
}

/**
 * Get patient by ID (tenant-scoped).
 */
async function getPatientById(tenantId, patientId) {
  const patient = await Patient.findOne({
    where: { id: patientId, tenantId },
  });
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }
  return patient;
}

/**
 * Update patient info.
 */
async function updatePatient(tenantId, patientId, data, userId) {
  const patient = await Patient.findOne({
    where: { id: patientId, tenantId },
  });
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  // If updating phone, check uniqueness within tenant
  if (data.phone && data.phone !== patient.phone) {
    const existing = await Patient.findOne({
      where: { tenantId, phone: data.phone },
    });
    if (existing) {
      throw new ApiError(409, 'Another patient with this phone number already exists');
    }
  }

  const allowedFields = ['name', 'phone', 'email', 'dateOfBirth', 'gender', 'address', 'bloodGroup', 'emergencyContact', 'medicalHistory'];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      patient[field] = data[field];
    }
  }

  await patient.save();

  await auditService.log({
    tenantId,
    userId,
    action: 'UPDATE',
    entityType: 'patient',
    entityId: patient.id,
    details: data,
  });

  return patient;
}

module.exports = { searchPatients, createPatient, getPatientById, updatePatient };
