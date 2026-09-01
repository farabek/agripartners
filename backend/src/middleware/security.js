const { rateLimit } = require('express-rate-limit');

function createLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: message },
  });
}

const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many authentication attempts. Try again later.',
});

const walletChallengeLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  message: 'Too many wallet challenge requests. Try again later.',
});

const walletVerifyLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 15,
  message: 'Too many wallet verification attempts. Try again later.',
});

module.exports = { loginLimiter, walletChallengeLimiter, walletVerifyLimiter };
