const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.listMyInvoices);

module.exports = router;
