const crypto = require('crypto');
global.crypto = crypto;
globalThis.crypto = crypto;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./config/db');
const { getContainerClient } = require('./config/blob');

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    await getContainerClient();
    res.json({ status: 'ok', message: 'AzureDrop API + Postgres + Azurite (Blob) are running' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('AzureDrop API is running. Go to /api/health');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('AzureDrop API running on port ' + PORT));