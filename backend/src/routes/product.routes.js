const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/search', productController.searchProducts);

module.exports = router;
