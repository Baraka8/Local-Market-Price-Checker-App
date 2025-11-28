const express = require('express');
const { getProducts, getProductById, createProduct, getCategories, createCategory } = require('../controllers/productController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, createProduct);

router.get('/categories/all', getCategories);
router.post('/categories', authenticateToken, createCategory);

module.exports = router;
