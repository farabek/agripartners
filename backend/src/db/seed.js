const userService = require('../services/userService');
const pool = require('./index');

async function seed() {
  const { rows } = await pool.query('SELECT COUNT(*) FROM users');
  if (parseInt(rows[0].count) > 0) return;

  await userService.createUser({
    username: 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@agripartners.local',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    role: 'admin',
    near_account: process.env.NEAR_ADMIN_ACCOUNT || null,
  });
  console.log('[seed] created default admin user (username: admin)');
}

module.exports = seed;
