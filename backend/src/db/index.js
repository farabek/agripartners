const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function getDb() {
  if (db) return db;
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../agripartners.db');
  db = new Database(dbPath);
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  return db;
}

module.exports = { getDb };
