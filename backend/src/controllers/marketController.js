const { pool } = require('../config/db');

// Get all markets
const getMarkets = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM markets ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get market by ID
const getMarketById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM markets WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Market not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create market (Admin only)
const createMarket = async (req, res) => {
    const { name, location, latitude, longitude, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO markets (name, location, latitude, longitude, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, location, latitude, longitude, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update market (Admin only)
const updateMarket = async (req, res) => {
    const { id } = req.params;
    const { name, location, latitude, longitude, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE markets SET name = $1, location = $2, latitude = $3, longitude = $4, description = $5 WHERE id = $6 RETURNING *',
            [name, location, latitude, longitude, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Market not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete market (Admin only)
const deleteMarket = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM markets WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Market not found' });
        }
        res.json({ message: 'Market deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getMarkets, getMarketById, createMarket, updateMarket, deleteMarket };
