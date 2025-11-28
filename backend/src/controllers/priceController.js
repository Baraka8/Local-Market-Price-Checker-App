const { pool } = require('../config/db');

// Get all prices
const getPrices = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, pr.name as product_name, m.name as market_name, u.username as submitted_by
       FROM prices p
       LEFT JOIN products pr ON p.product_id = pr.id
       LEFT JOIN markets m ON p.market_id = m.id
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get prices by product
const getPricesByProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        const result = await pool.query(
            `SELECT p.*, m.name as market_name, u.username as submitted_by
       FROM prices p
       LEFT JOIN markets m ON p.market_id = m.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.product_id = $1
       ORDER BY p.created_at DESC`,
            [productId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get prices by market
const getPricesByMarket = async (req, res) => {
    const { marketId } = req.params;
    try {
        const result = await pool.query(
            `SELECT p.*, pr.name as product_name, u.username as submitted_by
       FROM prices p
       LEFT JOIN products pr ON p.product_id = pr.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.market_id = $1
       ORDER BY p.created_at DESC`,
            [marketId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit price
const submitPrice = async (req, res) => {
    const { product_id, market_id, price, currency } = req.body;
    const user_id = req.user.id; // From JWT token

    try {
        const result = await pool.query(
            'INSERT INTO prices (product_id, market_id, user_id, price, currency) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [product_id, market_id, user_id, price, currency || 'RWF']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify price (Admin only)
const verifyPrice = async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    try {
        const result = await pool.query(
            'UPDATE prices SET verified = true WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Price not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete price (Admin or owner)
const deletePrice = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if user is admin or owner
        const priceCheck = await pool.query('SELECT * FROM prices WHERE id = $1', [id]);
        if (priceCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Price not found' });
        }

        if (req.user.role !== 'admin' && priceCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await pool.query('DELETE FROM prices WHERE id = $1', [id]);
        res.json({ message: 'Price deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getPrices,
    getPricesByProduct,
    getPricesByMarket,
    submitPrice,
    verifyPrice,
    deletePrice
};
