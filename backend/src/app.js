require('dotenv').config();
const express = require('express');
const { requireApiKey } = require('./middleware/auth');
const dealsRouter = require('./routes/deals');
const adminRouter = require('./routes/admin');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/deals', dealsRouter);
app.use('/api/admin', requireApiKey, adminRouter);

module.exports = app;
