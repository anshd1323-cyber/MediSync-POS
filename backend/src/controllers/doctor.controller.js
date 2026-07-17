const doctorService = require('../services/doctor.service');
const catchAsync = require('../utils/catchAsync');

const getAllDoctors = catchAsync(async (req, res) => {
  const doctors = await doctorService.listDoctors();
  res.status(200).json({ success: true, data: doctors });
});

const getDoctorById = catchAsync(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  res.status(200).json({ success: true, data: doctor });
});

module.exports = { getAllDoctors, getDoctorById };
