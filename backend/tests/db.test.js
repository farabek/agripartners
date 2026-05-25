process.env.TURSO_DATABASE_URL = ":memory:";
const { getDb, resetDb } = require("../src/db/index");

beforeEach(() => { resetDb(); });

test("creates deals and events tables on init", async () => {
  const db = await getDb();
  const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
  const names = result.rows.map(t => t.name);
  expect(names).toContain("deals");
  expect(names).toContain("events");
});

test("getDb returns same instance on repeated calls", async () => {
  const db1 = await getDb();
  const db2 = await getDb();
  expect(db1).toBe(db2);
});