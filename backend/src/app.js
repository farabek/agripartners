require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { requireApiKey } = require('./middleware/auth');
const dealsRouter = require('./routes/deals');
const adminRouter = require('./routes/admin');

['API_KEY', 'NEAR_ADMIN_ACCOUNT', 'NEAR_ADMIN_PRIVATE_KEY'].forEach(k => {
  if (!process.env[k]) throw new Error(`Missing required env var: ${k}`);
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/deals', dealsRouter);
app.use('/api/admin', requireApiKey, adminRouter);

module.exports = app;
