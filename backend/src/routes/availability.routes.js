const express = require('express');
const availabilityController = require('../controllers/availability.controller');
const authenticate = require('../middleware/auth.middleware');
const restrictTo = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

// Patient checks a doctor's open slots
router.get('/:doctorId/slots', availabilityController.getAvailableSlots);

// Doctor manages their own availability schedule
router.get('/', restrictTo('DOCTOR'), availabilityController.getMyAvailability);
router.post('/', restrictTo('DOCTOR'), availabilityController.setAvailability);

module.exports = router;
