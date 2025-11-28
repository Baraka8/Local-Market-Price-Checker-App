const express = require('express');
const { getMarkets, getMarketById, createMarket, updateMarket, deleteMarket } = require('../controllers/marketController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getMarkets);
router.get('/:id', getMarketById);
router.post('/', authenticateToken, createMarket);
router.put('/:id', authenticateToken, updateMarket);
router.delete('/:id', authenticateToken, deleteMarket);

module.exports = router;
