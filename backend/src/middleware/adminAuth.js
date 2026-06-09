const jwt = require('jsonwebtoken');

const LOCAL_MVP_ADMIN_WALLETS = ['farab.testnet'];

function configuredAdminWallets() {
  const configured = (process.env.ADMIN_WALLET_ALLOWLIST || '')
    .split(',')
    .map(account => account.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    return new Set([...configured, ...LOCAL_MVP_ADMIN_WALLETS]);
  }

  return new Set(configured);
}

function isAdminWallet(accountId) {
  return Boolean(accountId && configuredAdminWallets().has(accountId));
}

function requireAdminAccess(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET);

    if (payload.role === 'admin') {
      req.user = payload;
      return next();
    }

    if (
      payload.type === 'wallet-auth-poc' &&
      payload.network === 'testnet' &&
      isAdminWallet(payload.account_id)
    ) {
      req.user = {
        role: 'admin',
        auth_type: 'wallet',
        account_id: payload.account_id,
        near_account: payload.account_id,
        public_key: payload.public_key,
      };
      req.wallet = {
        account_id: payload.account_id,
        public_key: payload.public_key,
        network: payload.network,
      };
      return next();
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  requireAdminAccess,
  isAdminWallet,
};
