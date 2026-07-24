const {
  DATABASE_PREFIX,
  createDisposableDatabase,
  createOwnedDatabaseName,
  destroyDisposableDatabase,
  quoteIdentifier,
  redactConnectionString,
  sanitizeError,
  validateAdminUrl,
} = require('./helpers/disposablePostgresHarness');

const safeUrl = `postgresql://tester:secret@127.0.0.1:5432/${DATABASE_PREFIX}admin`;
const ownedDatabase = `${DATABASE_PREFIX}${'a'.repeat(32)}`;

test('destructive database verification fails closed without explicit opt-in', () => {
  expect(() => validateAdminUrl(safeUrl)).toThrow(/ALLOW_DESTRUCTIVE/);
});

test.each([
  [undefined, '1'],
  ['not a url', '1'],
  ['mysql://tester@localhost/agripartners_ephemeral_admin', '1'],
  ['postgresql://tester@localhost', '1'],
  ['postgresql://tester@localhost/postgres', '1'],
  ['postgresql://tester@localhost/template0', '1'],
  ['postgresql://tester@localhost/template1', '1'],
  ['postgresql://tester@localhost/production', '1'],
  ['postgresql://tester@localhost/agripartners_ephemeral_staging', '1'],
  ['postgresql://tester@localhost/shared', '1'],
  ['postgresql://tester@localhost/agripartners_ephemeral_shared', '1'],
  ['postgresql://tester@localhost/agripartners_test', '1'],
  ['postgresql://tester@localhost/AGRIPARTNERS_EPHEMERAL_ADMIN', '1'],
  ['postgresql://tester@localhost/agripartners%5Fephemeral%5Fshared', '1'],
  ['postgresql://tester@localhost/agripartners_ephemeral_admin%2Fother', '1'],
])('unsafe TEST_DATABASE_URL is rejected without connecting: %s', (url, optIn) => {
  expect(() => validateAdminUrl(url, optIn)).toThrow();
});

function harnessWithSentinel(rows, { database = ownedDatabase, dropError = null } = {}) {
  const pool = {
    query: jest.fn().mockResolvedValue({ rows }),
    end: jest.fn().mockResolvedValue(),
  };
  const adminPool = {
    query: jest.fn(async (sql) => {
      if (dropError && sql.startsWith('DROP DATABASE')) throw dropError;
      return { rows: [] };
    }),
    end: jest.fn().mockResolvedValue(),
  };
  return {
    harness: {
      pool,
      adminPool,
      database,
      runId: '11111111-1111-4111-8111-111111111111',
      adminUrl: safeUrl,
    },
    pool,
    adminPool,
  };
}

test.each([
  ['missing sentinel', []],
  ['sentinel run_id mismatch', []],
  ['sentinel child database mismatch', [{ database_name: `${DATABASE_PREFIX}${'b'.repeat(32)}` }]],
])('%s prevents DROP DATABASE and still closes pools', async (_label, rows) => {
  const { harness, pool, adminPool } = harnessWithSentinel(rows);
  await expect(destroyDisposableDatabase(harness)).rejects.toThrow(/sentinel does not match/);
  expect(adminPool.query.mock.calls.some(([sql]) => sql.startsWith('DROP DATABASE'))).toBe(false);
  expect(pool.end).toHaveBeenCalled();
  expect(adminPool.end).toHaveBeenCalled();
});

test('cleanup refuses a database not created by the current harness', async () => {
  const { harness, adminPool } = harnessWithSentinel(
    [{ database_name: `${DATABASE_PREFIX}admin` }],
    { database: `${DATABASE_PREFIX}admin` }
  );
  await expect(destroyDisposableDatabase(harness)).rejects.toThrow(/not created by this harness/);
  expect(adminPool.query.mock.calls.some(([sql]) => sql.startsWith('DROP DATABASE'))).toBe(false);
});

test('successful child cleanup preserves the administrative database', async () => {
  const { harness, adminPool } = harnessWithSentinel([{ database_name: ownedDatabase }]);
  await destroyDisposableDatabase(harness);
  const destructive = adminPool.query.mock.calls
    .map(([sql]) => sql)
    .filter((sql) => /DROP DATABASE/.test(sql));
  expect(destructive).toEqual([`DROP DATABASE "${ownedDatabase}"`]);
  expect(destructive[0]).not.toContain(`${DATABASE_PREFIX}admin`);
});

test('setup failure after child creation drops only the generated child and redacts errors', async () => {
  const instances = [];
  class FakePool {
    constructor() {
      this.index = instances.length;
      this.queries = [];
      this.end = jest.fn().mockResolvedValue();
      instances.push(this);
    }
    async query(sql) {
      this.queries.push(sql);
      if (this.index === 1) {
        throw Object.assign(new Error(`failed using ${safeUrl}`), { code: 'XX001' });
      }
      return { rows: [] };
    }
  }
  await expect(createDisposableDatabase({
    adminUrl: safeUrl,
    optIn: '1',
    PoolClass: FakePool,
    database: ownedDatabase,
    runId: '11111111-1111-4111-8111-111111111111',
  })).rejects.toMatchObject({ code: 'XX001' });
  const adminSql = instances[0].queries.join('\n');
  expect(adminSql).toContain(`CREATE DATABASE "${ownedDatabase}"`);
  expect(adminSql).toContain(`DROP DATABASE "${ownedDatabase}"`);
  expect(instances[0].end).toHaveBeenCalled();
  expect(instances[1].end).toHaveBeenCalled();
});

test('cleanup failure is contextual, redacted, and closes every pool', async () => {
  const raw = Object.assign(new Error(`drop failed at ${safeUrl}`), { code: 'XX002' });
  const { harness, pool, adminPool } = harnessWithSentinel(
    [{ database_name: ownedDatabase }],
    { dropError: raw }
  );
  const error = await destroyDisposableDatabase(harness).catch((caught) => caught);
  expect(error).toMatchObject({ code: 'XX002' });
  expect(error.message).not.toContain('secret');
  expect(error.message).toContain('[redacted]');
  expect(pool.end).toHaveBeenCalled();
  expect(adminPool.end).toHaveBeenCalled();
});

test('PostgreSQL errors redact URL, detail, nested cause, malformed URL, and repeats', () => {
  const nested = new Error(`nested ${safeUrl}`);
  const raw = Object.assign(
    new Error(`primary ${safeUrl} then ${safeUrl} and postgresql://bad:secret@host/%zz`),
    { code: '08001', detail: `detail ${safeUrl}`, cause: nested }
  );
  const error = sanitizeError(raw, { context: 'connect', adminUrl: safeUrl });
  expect(error.code).toBe('08001');
  for (const visible of [error.message, error.detail, error.cause.message]) {
    expect(visible).not.toContain('secret');
    expect(visible).not.toContain('tester');
    expect(visible).toContain('[redacted');
  }
});

test('approved disposable admin URL is accepted and credentials are redacted', () => {
  expect(validateAdminUrl(safeUrl, '1').database).toBe(`${DATABASE_PREFIX}admin`);
  const redacted = redactConnectionString(safeUrl);
  expect(redacted).not.toContain('tester');
  expect(redacted).not.toContain('secret');
  expect(redacted).toContain(`${DATABASE_PREFIX}admin`);
});

test('cleanup identifiers are limited to harness-generated databases', () => {
  const owned = createOwnedDatabaseName();
  expect(owned).toMatch(/^agripartners_ephemeral_[a-f0-9]{32}$/);
  expect(quoteIdentifier(owned)).toBe(`"${owned}"`);
  expect(() => quoteIdentifier(`${DATABASE_PREFIX}admin`)).toThrow(/not created by this harness/);
  expect(() => quoteIdentifier('production')).toThrow(/not created by this harness/);
});
