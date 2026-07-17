const { Invoice, User } = require('../models');
const ApiError = require('../utils/ApiError');

async function createInvoice(doctorId, payload) {
  const doctor = await User.findOne({ where: { id: doctorId, role: 'DOCTOR' } });
  if (!doctor) {
    throw new ApiError(404, 'Doctor/practitioner profile not found');
  }

  const {
    patientId,
    patientName,
    items,
    totalAmount,
    paymentMethod,
    paymentStatus,
    tax,
    discount
  } = payload;

  return Invoice.create({
    doctorId,
    patientId: patientId || null,
    patientName: patientName || 'Walk-in Patient',
    items: JSON.stringify(items || []),
    totalAmount: totalAmount || 0.00,
    paymentMethod: paymentMethod || 'CASH',
    paymentStatus: paymentStatus || 'PAID',
    tax: tax || 0.00,
    discount: discount || 0.00
  });
}

async function listInvoicesForDoctor(doctorId) {
  return Invoice.findAll({
    where: { doctorId },
    order: [['createdAt', 'DESC']]
  });
}

async function listInvoicesForPatient(patientId) {
  return Invoice.findAll({
    where: { patientId },
    order: [['createdAt', 'DESC']]
  });
}

module.exports = {
  createInvoice,
  listInvoicesForDoctor,
  listInvoicesForPatient
};
