const availabilityService = require('../services/availability.service');
const catchAsync = require('../utils/catchAsync');

const setAvailability = catchAsync(async (req, res) => {
  const result = await availabilityService.setAvailability(req.user.id, req.body.availabilities);
  res.status(200).json({ success: true, data: result });
});

const getMyAvailability = catchAsync(async (req, res) => {
  const data = await availabilityService.getAvailability(req.user.id);
  res.status(200).json({ success: true, data });
});

const getAvailableSlots = catchAsync(async (req, res) => {
  const data = await availabilityService.getAvailableSlots(req.params.doctorId, req.query.date);
  res.status(200).json({ success: true, data });
});

module.exports = { setAvailability, getMyAvailability, getAvailableSlots };
