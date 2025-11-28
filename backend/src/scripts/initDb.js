const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const schemaPath = path.join(__dirname, '../db/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function initDb() {
    try {
        console.log('Running schema...');
        await pool.query(schema);
        console.log('Database initialized successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDb();
