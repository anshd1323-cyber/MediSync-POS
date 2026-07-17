const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/book', appointmentController.bookAppointment);

module.exports = router;
