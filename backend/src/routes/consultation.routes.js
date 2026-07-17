const express = require('express');
const consultationController = require('../controllers/consultation.controller');
const messageController = require('../controllers/message.controller');
const authenticate = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createConsultationRules,
  consultationIdParamRule,
  updateStatusRules,
  sendMessageRules,
} = require('../utils/validators');

const router = express.Router();

router.use(authenticate);

router.post('/', restrictTo('PATIENT'), createConsultationRules, validate, consultationController.createConsultation);
router.get('/', consultationController.listConsultations);
router.get('/:id', consultationIdParamRule, validate, consultationController.getConsultation);
router.patch('/:id/status', restrictTo('DOCTOR'), updateStatusRules, validate, consultationController.updateStatus);
router.patch('/:id/notes', restrictTo('DOCTOR'), consultationIdParamRule, validate, consultationController.updateNotes);

router.post('/:id/messages', sendMessageRules, validate, messageController.sendMessage);
router.get('/:id/messages', consultationIdParamRule, validate, messageController.getMessages);

module.exports = router;
