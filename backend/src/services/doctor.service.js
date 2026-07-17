const { User, DoctorProfile } = require('../models');
const ApiError = require('../utils/ApiError');

async function listDoctors() {
  return User.findAll({
    where: { role: 'DOCTOR' },
    attributes: ['id', 'name', 'email', 'createdAt'],
    include: [{ model: DoctorProfile, as: 'doctorProfile' }],
  });
}

async function getDoctorById(id) {
  const doctor = await User.findOne({
    where: { id, role: 'DOCTOR' },
    attributes: ['id', 'name', 'email', 'createdAt'],
    include: [{ model: DoctorProfile, as: 'doctorProfile' }],
  });

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  return doctor;
}

module.exports = { listDoctors, getDoctorById };
