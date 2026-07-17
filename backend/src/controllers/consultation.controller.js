const consultationService = require('../services/consultation.service');
const catchAsync = require('../utils/catchAsync');

const createConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.createConsultation(
    req.user.id, 
    req.body.doctorId, 
    req.body.scheduledAt,
    req.body.paymentStatus,
    req.body.fee
  );
  res.status(201).json({ success: true, data: consultation });
});

const listConsultations = catchAsync(async (req, res) => {
  const consultations = await consultationService.listConsultationsForUser(req.user);
  res.status(200).json({ success: true, data: consultations });
});

const getConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.getConsultationById(req.params.id, req.user);
  res.status(200).json({ success: true, data: consultation });
});

const updateStatus = catchAsync(async (req, res) => {
  const consultation = await consultationService.updateStatus(req.params.id, req.body.status, req.user);
  res.status(200).json({ success: true, data: consultation });
});

const updateNotes = catchAsync(async (req, res) => {
  const consultation = await consultationService.updateNotes(req.params.id, req.body.notes, req.user);
  res.status(200).json({ success: true, data: consultation });
});

module.exports = { 
  createConsultation, 
  listConsultations, 
  getConsultation, 
  updateStatus,
  updateNotes 
};
