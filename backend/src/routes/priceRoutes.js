const express = require('express');
const {
    getPrices,
    getPricesByProduct,
    getPricesByMarket,
    submitPrice,
    verifyPrice,
    deletePrice
} = require('../controllers/priceController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPrices);
router.get('/product/:productId', getPricesByProduct);
router.get('/market/:marketId', getPricesByMarket);
router.post('/', authenticateToken, submitPrice);
router.patch('/:id/verify', authenticateToken, verifyPrice);
router.delete('/:id', authenticateToken, deletePrice);

module.exports = router;
