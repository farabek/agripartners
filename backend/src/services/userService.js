const bcrypt = require('bcrypt');
const pool = require('../db/index');

const SALT_ROUNDS = 10;

async function createUser({ username, email, password, role, near_account }) {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO users (username, email, password_hash, role, near_account)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, email, role, near_account, created_at`,
    [username, email, password_hash, role, near_account || null]
  );
  return rows[0];
}

async function findByUsername(username) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, username, email, role, near_account, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

module.exports = { createUser, findByUsername, findById, verifyPassword };
