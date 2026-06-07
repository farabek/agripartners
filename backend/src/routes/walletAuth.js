const router = require('express').Router();
const walletAuthService = require('../services/walletAuthService');

router.post('/challenge', (req, res) => {
  res.json(walletAuthService.createChallenge());
});

router.post('/verify', async (req, res) => {
  try {
    const result = await walletAuthService.verifyWalletSignature(req.body);
    console.log('VERIFY RESPONSE PAYLOAD', {
      ...result,
      token: result.token?.slice(0, 20),
    });
    res.json(result);
  } catch (err) {
    console.log('[wallet-auth-poc] verify failed before token response', {
      error: err.message,
    });
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;
