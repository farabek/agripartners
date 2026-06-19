require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createCorsOptions } = require('./config/cors');
const { requireJWT } = require('./middleware/jwtAuth');
const { requireAdminAccess } = require('./middleware/adminAuth');
const authRouter = require('./routes/auth');
const dealsRouter = require('./routes/deals');
const adminRouter = require('./routes/admin');
const meRouter = require('./routes/me');
const walletAuthRouter = require('./routes/walletAuth');
const investorRouter = require('./routes/investor');
const farmerRouter = require('./routes/farmer');
const profileRouter = require('./routes/profile');
const { requireWalletAuth } = require('./middleware/walletAuth');

['API_KEY', 'NEAR_ADMIN_ACCOUNT', 'NEAR_ADMIN_PRIVATE_KEY', 'JWT_SECRET'].forEach(k => {
  if (!process.env[k]) throw new Error(`Missing required env var: ${k}`);
});

const app = express();
app.use(cors(createCorsOptions()));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'agripartners-backend',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/wallet-auth', walletAuthRouter);
app.use('/api/profile', requireWalletAuth, profileRouter);
app.use('/api/investor', requireWalletAuth, investorRouter);
app.use('/api/farmer', requireWalletAuth, farmerRouter);
app.use('/api/admin', requireAdminAccess, adminRouter);
app.use('/api/me', requireJWT, meRouter);

module.exports = app;
