const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Ensure prisma directory exists
const dbDir = path.join(__dirname, '../prisma');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'dev.db');
const database = new DatabaseSync(dbPath);

console.log('Connected to database at:', dbPath);

// Ensure the Account table exists
database.exec(`
  CREATE TABLE IF NOT EXISTS Account (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0.0,
    updatedAt TEXT NOT NULL
  );
`);

const seedAccounts = [
  { id: 'acc_pg', name: 'Power Generator (PG)', type: 'GENERATOR', balance: 0.0 },
  { id: 'acc_pd', name: 'Power Distributor (PD)', type: 'DISTRIBUTOR', balance: 0.0 },
  { id: 'acc_consumer', name: 'Consumer (C)', type: 'CONSUMER', balance: 0.0 },
  { id: 'acc_vendor', name: 'Equipment Vendor', type: 'VENDOR', balance: 0.0 },
  { id: 'acc_clearing', name: '4-Party Accounting Clearing House', type: 'CLEARING_HOUSE', balance: 0.0 },
];

const stmt = database.prepare(`
  INSERT OR REPLACE INTO Account (id, name, type, balance, updatedAt)
  VALUES (?, ?, ?, ?, DATETIME('now'))
`);

try {
  for (const acc of seedAccounts) {
    stmt.run(acc.id, acc.name, acc.type, acc.balance);
  }
  console.log('Successfully seeded clearing house accounts into SQLite!');
} catch (err) {
  console.error('Seeding failed:', err.message);
} finally {
  database.close();
}