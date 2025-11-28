const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Local Market Price Checker API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
