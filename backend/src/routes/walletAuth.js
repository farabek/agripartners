const router = require('express').Router();
const walletAuthService = require('../services/walletAuthService');
const { walletChallengeLimiter, walletVerifyLimiter } = require('../middleware/security');

router.post('/challenge', walletChallengeLimiter, async (req, res) => {
  res.json(await walletAuthService.createChallenge());
});

router.post('/verify', walletVerifyLimiter, async (req, res) => {
  try {
    const result = await walletAuthService.verifyWalletSignature(req.body);
    res.json(result);
  } catch (err) {
    console.warn('[wallet-auth] verification rejected', { reason: err.message });
    res.status(401).json({ error: 'Wallet verification failed' });
  }
});

module.exports = router;
