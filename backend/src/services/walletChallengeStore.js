const pool = require('../db');

const testStore = new Map();

function useMemoryStore() {
  return process.env.NODE_ENV === 'test';
}

async function create({ nonce, message, recipient, nonceBytes, expiresAt }) {
  if (useMemoryStore()) {
    testStore.set(nonce, { message, recipient, nonceBytes, expiresAt, used: false });
    return;
  }
  await pool.query(
    `INSERT INTO wallet_auth_challenges
       (nonce, message, recipient, nonce_bytes, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [nonce, message, recipient, nonceBytes, new Date(expiresAt)]
  );
}

async function consume(nonce) {
  if (useMemoryStore()) {
    const challenge = testStore.get(nonce);
    if (!challenge || challenge.used || challenge.expiresAt <= Date.now()) {
      testStore.delete(nonce);
      return null;
    }
    challenge.used = true;
    testStore.delete(nonce);
    return challenge;
  }
  const { rows } = await pool.query(
    `UPDATE wallet_auth_challenges
        SET consumed_at = NOW()
      WHERE nonce = $1
        AND consumed_at IS NULL
        AND expires_at > NOW()
      RETURNING message, recipient, nonce_bytes, expires_at`,
    [nonce]
  );
  if (!rows[0]) return null;
  return {
    message: rows[0].message,
    recipient: rows[0].recipient,
    nonceBytes: Buffer.from(rows[0].nonce_bytes),
    expiresAt: new Date(rows[0].expires_at).getTime(),
  };
}

async function release(nonce) {
  if (useMemoryStore()) return;
  await pool.query(
    `UPDATE wallet_auth_challenges SET consumed_at = NULL
      WHERE nonce = $1 AND consumed_at IS NOT NULL`,
    [nonce]
  );
}

module.exports = { create, consume, release };
