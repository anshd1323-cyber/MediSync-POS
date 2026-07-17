const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discovery.controller');

router.get('/search', discoveryController.searchClinics);

module.exports = router;
