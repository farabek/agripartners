require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const helmet = require('helmet');
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
const projectExpensesRouter = require('./routes/projectExpenses');
const { requireWalletAuth } = require('./middleware/walletAuth');
const { notFoundHandler, errorHandler } = require('./middleware/errors');
const pool = require('./db');

['API_KEY', 'NEAR_ADMIN_ACCOUNT', 'NEAR_ADMIN_PRIVATE_KEY', 'JWT_SECRET'].forEach(k => {
  if (!process.env[k]) throw new Error(`Missing required env var: ${k}`);
});

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  const sendJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 500 && body && typeof body.error === 'string') {
      console.error('[request.internal-error]', {
        request_id: req.requestId,
        method: req.method,
        path: req.originalUrl,
        internal_message: body.error,
      });
      return sendJson({
        ...body,
        error: 'Internal server error',
        code: body.code || 'INTERNAL_ERROR',
        request_id: req.requestId,
      });
    }
    return sendJson(body);
  };
  next();
});
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  referrerPolicy: { policy: 'no-referrer' },
}));
app.use(cors(createCorsOptions()));
app.use(express.json({ limit: '256kb', strict: true }));

app.get('/health/live', (req, res) => {
  res.json({
    ok: true,
    service: 'agripartners-backend',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM _migrations');
    res.json({
      ok: true,
      service: 'agripartners-backend',
      database: 'ready',
      migrations: rows[0].count,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      service: 'agripartners-backend',
      database: 'unavailable',
      code: 'NOT_READY',
    });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/wallet-auth', walletAuthRouter);
app.use('/api/profile', requireWalletAuth, profileRouter);
app.use('/api/investor', requireWalletAuth, investorRouter);
app.use('/api/farmer', requireWalletAuth, farmerRouter);
app.use('/api/admin', requireAdminAccess, adminRouter);
app.use('/api/admin/project-expenses', requireAdminAccess, projectExpensesRouter);
app.use('/api/me', requireJWT, meRouter);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
