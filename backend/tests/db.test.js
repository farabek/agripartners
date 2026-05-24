process.env.DB_PATH = ':memory:';
const { getDb } = require('../src/db/index');

test('creates deals and events tables on init', () => {
  const db = getDb();
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const names = tables.map(t => t.name);
  expect(names).toContain('deals');
  expect(names).toContain('events');
});

test('getDb returns same instance on repeated calls', () => {
  const db1 = getDb();
  const db2 = getDb();
  expect(db1).toBe(db2);
});
