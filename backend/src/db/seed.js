const userService = require('../services/userService');
const pool = require('./index');

async function seed() {
  const { rows } = await pool.query('SELECT COUNT(*) FROM users');
  if (parseInt(rows[0].count, 10) > 0) return;

  if (!process.env.ADMIN_PASSWORD) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_PASSWORD is required in production');
    }

    console.warn(
      '[seed] ADMIN_PASSWORD is not set. Using local development default password.',
    );
  }

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
