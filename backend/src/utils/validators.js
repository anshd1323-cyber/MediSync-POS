const { body, param } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('email').isEmail().withMessage('a valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  body('role').isIn(['PATIENT', 'DOCTOR']).withMessage('role must be PATIENT or DOCTOR'),
  body('specialization')
    .if(body('role').equals('DOCTOR'))
    .trim()
    .notEmpty()
    .withMessage('specialization is required for doctors'),
  body('yearsOfExperience')
    .if(body('role').equals('DOCTOR'))
    .isInt({ min: 0 })
    .withMessage('yearsOfExperience must be a non-negative number'),
];

const loginRules = [
  body('email').isEmail().withMessage('a valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('password is required'),
];

const doctorIdParamRule = [param('id').isInt().withMessage('id must be a valid integer')];

const createConsultationRules = [body('doctorId').isInt().withMessage('doctorId must be a valid integer')];

const consultationIdParamRule = [param('id').isInt().withMessage('id must be a valid integer')];

const updateStatusRules = [
  param('id').isInt().withMessage('id must be a valid integer'),
  body('status').isIn(['PENDING', 'ACTIVE', 'COMPLETED']).withMessage('invalid status value'),
];

const sendMessageRules = [
  param('id').isInt().withMessage('id must be a valid integer'),
  body('message').trim().notEmpty().withMessage('message is required'),
];

module.exports = {
  registerRules,
  loginRules,
  doctorIdParamRule,
  createConsultationRules,
  consultationIdParamRule,
  updateStatusRules,
  sendMessageRules,
};
