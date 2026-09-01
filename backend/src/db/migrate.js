const fs = require('fs');
const path = require('path');
const pool = require('./index');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(hashtext('agripartners:migrations'))");
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename TEXT PRIMARY KEY,
        run_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const filename of files) {
      const { rows } = await client.query(
        'SELECT filename FROM _migrations WHERE filename = $1',
        [filename]
      );
      if (rows.length > 0) continue;

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [filename]
        );
        await client.query('COMMIT');
        console.log(`[migrate] applied: ${filename}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext('agripartners:migrations'))").catch(() => {});
    client.release();
  }
}

module.exports = migrate;
