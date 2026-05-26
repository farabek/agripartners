require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/index');
const { requireJWT, requireRole } = require('./middleware/jwtAuth');
const authRouter = require('./routes/auth');
const dealsRouter = require('./routes/deals');
const adminRouter = require('./routes/admin');
const meRouter = require('./routes/me');

['API_KEY', 'NEAR_ADMIN_ACCOUNT', 'NEAR_ADMIN_PRIVATE_KEY', 'JWT_SECRET'].forEach(k => {
  if (!process.env[k]) throw new Error(`Missing required env var: ${k}`);
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/admin', requireJWT, requireRole('admin'), adminRouter);
app.use('/api/me', requireJWT, meRouter);

module.exports = app;
