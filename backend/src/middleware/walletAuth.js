const jwt = require('jsonwebtoken');

function requireWalletAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Wallet authentication required' });
  }

  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    if (payload.type !== 'wallet-auth-poc' || payload.network !== 'testnet') {
      return res.status(403).json({ error: 'Invalid wallet authentication token' });
    }

    req.wallet = {
      account_id: payload.account_id,
      public_key: payload.public_key,
      network: payload.network,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired wallet token' });
  }
}

module.exports = { requireWalletAuth };
