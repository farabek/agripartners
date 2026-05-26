require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/index');
const { requireApiKey } = require('./middleware/auth');
const dealsRouter = require('./routes/deals');
const adminRouter = require('./routes/admin');

['API_KEY', 'NEAR_ADMIN_ACCOUNT', 'NEAR_ADMIN_PRIVATE_KEY'].forEach(k => {
  if (!process.env[k]) throw new Error(`Missing required env var: ${k}`);
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/debug-key', (req, res) => {
  const key = process.env.NEAR_ADMIN_PRIVATE_KEY || '';
  res.json({
    length: key.length,
    starts_with_ed25519: key.startsWith('ed25519:'),
    first_15_chars: key.substring(0, 15),
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});
app.use('/api/deals', dealsRouter);
app.use('/api/admin', requireApiKey, adminRouter);

module.exports = app;
