const express = require('express');
const doctorController = require('../controllers/doctor.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { doctorIdParamRule } = require('../utils/validators');

const router = express.Router();

router.get('/', authenticate, doctorController.getAllDoctors);
router.get('/:id', authenticate, doctorIdParamRule, validate, doctorController.getDoctorById);

module.exports = router;
