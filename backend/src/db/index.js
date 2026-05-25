const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

let client = null;

async function getDb() {
  if (client) return client;
  client = createClient({
    url: process.env.TURSO_DATABASE_URL || ":memory:",
    authToken: process.env.TURSO_AUTH_TOKEN
  });
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const stmts = schema.split(";").map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of stmts) {
    await client.execute(stmt);
  }
  return client;
}

function resetDb() {
  client = null;
}

module.exports = { getDb, resetDb };