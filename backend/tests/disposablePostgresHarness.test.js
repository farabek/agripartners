const {
  DATABASE_PREFIX,
  createOwnedDatabaseName,
  quoteIdentifier,
  redactConnectionString,
  validateAdminUrl,
} = require('./helpers/disposablePostgresHarness');

const safeUrl = `postgresql://tester:secret@127.0.0.1:5432/${DATABASE_PREFIX}admin`;

test('destructive database verification fails closed without explicit opt-in', () => {
  expect(() => validateAdminUrl(safeUrl)).toThrow(/ALLOW_DESTRUCTIVE/);
});

test.each([
  [undefined, '1'],
  ['not a url', '1'],
  ['mysql://tester@localhost/agripartners_ephemeral_admin', '1'],
  ['postgresql://tester@localhost', '1'],
  ['postgresql://tester@localhost/postgres', '1'],
  ['postgresql://tester@localhost/production', '1'],
  ['postgresql://tester@localhost/shared', '1'],
  ['postgresql://tester@localhost/agripartners_ephemeral_shared', '1'],
  ['postgresql://tester@localhost/agripartners_test', '1'],
])('unsafe TEST_DATABASE_URL is rejected without connecting: %s', (url, optIn) => {
  expect(() => validateAdminUrl(url, optIn)).toThrow();
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
