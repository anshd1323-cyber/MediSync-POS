const { Consultation, User } = require('../models');
const ApiError = require('../utils/ApiError');

const VALID_STATUSES = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

async function createConsultation(patientId, doctorId, scheduledAt, paymentStatus, fee) {
  const doctor = await User.findOne({ where: { id: doctorId, role: 'DOCTOR' } });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  return Consultation.create({ 
    patientId, 
    doctorId, 
    status: 'PENDING',
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    paymentStatus: paymentStatus || 'UNPAID',
    fee: fee || 15.00
  });
}

async function listConsultationsForUser(user) {
  const where = user.role === 'DOCTOR' ? { doctorId: user.id } : { patientId: user.id };

  return Consultation.findAll({
    where,
    include: [
      { model: User, as: 'patient', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}

async function getConsultationById(id, user) {
  const consultation = await Consultation.findByPk(id, {
    include: [
      { model: User, as: 'patient', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'doctor', attributes: ['id', 'name', 'email'] },
    ],
  });

  if (!consultation) {
    throw new ApiError(404, 'Consultation not found');
  }

  assertIsParticipant(consultation, user);

  return consultation;
}

async function updateStatus(id, newStatus, user) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const consultation = await Consultation.findByPk(id);
  if (!consultation) {
    throw new ApiError(404, 'Consultation not found');
  }

  const isDoctor = consultation.doctorId === user.id;
  const isPatient = consultation.patientId === user.id;

  if (!isDoctor && !isPatient) {
    throw new ApiError(403, 'You are not authorized to update this consultation status');
  }

  if (isPatient && newStatus !== 'CANCELLED') {
    throw new ApiError(403, 'Patients can only cancel consultations');
  }

  if (consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED') {
    throw new ApiError(400, 'Completed or cancelled consultations cannot be modified');
  }

  consultation.status = newStatus;
  await consultation.save();

  return consultation;
}

async function updateNotes(id, notes, user) {
  const consultation = await Consultation.findByPk(id);
  if (!consultation) {
    throw new ApiError(404, 'Consultation not found');
  }

  if (consultation.doctorId !== user.id) {
    throw new ApiError(403, 'Only the assigned doctor can edit clinical notes');
  }

  if (consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED') {
    throw new ApiError(400, 'Completed or cancelled consultations cannot be modified');
  }

  consultation.notes = typeof notes === 'string' ? notes : JSON.stringify(notes);
  await consultation.save();

  return consultation;
}

function assertIsParticipant(consultation, user) {
  const isParticipant = consultation.patientId === user.id || consultation.doctorId === user.id;
  if (!isParticipant) {
    throw new ApiError(403, 'You do not have access to this consultation');
  }
}

module.exports = {
  createConsultation,
  listConsultationsForUser,
  getConsultationById,
  updateStatus,
  updateNotes,
  assertIsParticipant,
};
