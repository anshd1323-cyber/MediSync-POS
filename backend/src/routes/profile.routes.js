const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, authController.getProfile);

module.exports = router;
