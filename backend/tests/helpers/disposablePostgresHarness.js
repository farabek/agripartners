const crypto = require('crypto');
const { Pool } = require('pg');

const DATABASE_PREFIX = 'agripartners_ephemeral_';
const OPT_IN_VALUE = '1';

function validateAdminUrl(rawUrl, optIn) {
  if (optIn !== OPT_IN_VALUE) {
    throw new Error('Destructive PostgreSQL tests require AGRIPARTNERS_ALLOW_DESTRUCTIVE_TEST_DB=1');
  }
  if (!rawUrl) throw new Error('TEST_DATABASE_URL is required');

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('TEST_DATABASE_URL is malformed');
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('TEST_DATABASE_URL must use PostgreSQL');
  }
  const database = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
  if (!database || database.includes('/')) {
    throw new Error('TEST_DATABASE_URL must name one database');
  }
  if (!/^[a-z][a-z0-9_]{2,62}$/.test(database)) {
    throw new Error('TEST_DATABASE_URL database name is unsafe');
  }
  if (!database.startsWith(DATABASE_PREFIX)) {
    throw new Error(`TEST_DATABASE_URL database must start with ${DATABASE_PREFIX}`);
  }
  if (/(^|_)(postgres|template0|template1|production|prod|staging|stage|shared)($|_)/i.test(database)) {
    throw new Error('TEST_DATABASE_URL names a system or shared database');
  }
  return { parsed, database };
}

function createOwnedDatabaseName() {
  return `${DATABASE_PREFIX}${crypto.randomUUID().replace(/-/g, '')}`;
}

function quoteIdentifier(identifier) {
  if (!new RegExp(`^${DATABASE_PREFIX}[a-f0-9]{32}$`).test(identifier)) {
    throw new Error('Refusing a database identifier not created by this harness');
  }
  return `"${identifier}"`;
}

function childConnectionString(parsed, database) {
  const child = new URL(parsed.toString());
  child.pathname = `/${database}`;
  return child.toString();
}

async function createDisposableDatabase({ adminUrl, optIn }) {
  const { parsed } = validateAdminUrl(adminUrl, optIn);
  const database = createOwnedDatabaseName();
  const runId = crypto.randomUUID();
  const adminPool = new Pool({ connectionString: parsed.toString(), max: 2 });
  let pool;
  let databaseCreated = false;
  try {
    await adminPool.query(`CREATE DATABASE ${quoteIdentifier(database)}`);
    databaseCreated = true;
    pool = new Pool({ connectionString: childConnectionString(parsed, database), max: 10 });
    await pool.query(
      `CREATE TABLE public.agripartners_test_database_sentinel (
         run_id UUID PRIMARY KEY,
         database_name TEXT NOT NULL UNIQUE,
         created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
       )`
    );
    await pool.query(
      'INSERT INTO public.agripartners_test_database_sentinel (run_id, database_name) VALUES ($1, $2)',
      [runId, database]
    );
    return { adminPool, pool, database, runId };
  } catch (error) {
    if (pool) await pool.end().catch(() => {});
    if (databaseCreated) {
      await adminPool.query(
        'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
        [database]
      ).catch(() => {});
      await adminPool.query(`DROP DATABASE ${quoteIdentifier(database)}`).catch(() => {});
    }
    await adminPool.end().catch(() => {});
    throw error;
  }
}

async function destroyDisposableDatabase(harness) {
  if (!harness) return;
  const { adminPool, pool, database, runId } = harness;
  try {
    const marker = await pool.query(
      'SELECT database_name FROM public.agripartners_test_database_sentinel WHERE run_id = $1',
      [runId]
    );
    if (marker.rows[0]?.database_name !== database) {
      throw new Error('Refusing cleanup because the harness ownership sentinel does not match');
    }
    const identifier = quoteIdentifier(database);
    await pool.end();
    await adminPool.query(
      'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
      [database]
    );
    await adminPool.query(`DROP DATABASE ${identifier}`);
  } finally {
    if (!pool.ended) await pool.end().catch(() => {});
    await adminPool.end().catch(() => {});
  }
}

function redactConnectionString(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.username) parsed.username = '[redacted]';
    if (parsed.password) parsed.password = '[redacted]';
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return '[invalid PostgreSQL URL]';
  }
}

module.exports = {
  DATABASE_PREFIX,
  createDisposableDatabase,
  createOwnedDatabaseName,
  destroyDisposableDatabase,
  quoteIdentifier,
  redactConnectionString,
  validateAdminUrl,
};
