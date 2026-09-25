import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// --- 1. Dynamic IDL Path Resolution ---
const possiblePaths = [
  path.resolve(__dirname, 'target/idl/tati_energy_rewards.json'),
  path.resolve(__dirname, '../target/idl/tati_energy_rewards.json'),
  path.resolve(__dirname, 'scripts/target/idl/tati_energy_rewards.json')
];

let idlPath = possiblePaths.find(p => fs.existsSync(p));

if (!idlPath) {
  idlPath = path.resolve(__dirname, 'target/idl/tati_energy_rewards.json');
  fs.mkdirSync(path.dirname(idlPath), { recursive: true });
  fs.writeFileSync(
    idlPath,
    JSON.stringify({ version: '0.1.0', name: 'tati_energy_rewards', instructions: [], accounts: [] }, null, 2)
  );
}

const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
console.log(`[Listener] Loaded Anchor IDL (${idl.name} v${idl.version}) from: ${idlPath}`);

// --- 2. Database & Valuation Configuration ---
const TATI_USD_RATE = 197.50; // 1 TATI = 1 MWh = $197.50 USD
const dbPath = path.resolve(__dirname, 'prisma/dev.db');

if (!fs.existsSync(dbPath)) {
  console.error(`[Listener Error] SQLite database not found at ${dbPath}. Run seed_direct.js first.`);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
console.log(`[Listener] Connected to SQLite database at: ${dbPath}`);

// --- 3. Telemetry Processing Engine ---
export interface TelemetryPayload {
  generatorId: string;
  kwhGenerated: number;
  timestamp: string;
  nonce: string;
  signature: string;
}

export function processTelemetryPayload(payload: TelemetryPayload) {
  const mwhGenerated = payload.kwhGenerated / 1000;
  const tatiEarned = mwhGenerated; // 1 MWh = 1 TATI
  const usdValue = tatiEarned * TATI_USD_RATE;

  console.log(`\n================ TELEMETRY EVENT RECORDED ================`);
  console.log(`Generator ID : ${payload.generatorId}`);
  console.log(`Energy Read  : ${payload.kwhGenerated} kWh (${mwhGenerated.toFixed(4)} MWh)`);
  console.log(`TATI Issued  : ${tatiEarned.toFixed(4)} TATI`);
  console.log(`Valuation    : $${usdValue.toFixed(2)} USD (@ $${TATI_USD_RATE}/MWh)`);
  console.log(`Timestamp    : ${payload.timestamp}`);
  console.log(`==========================================================\n`);

  try {
    const updateStmt = db.prepare(`
      UPDATE Account 
      SET balance = balance + ?, updatedAt = DATETIME('now')
      WHERE id = 'acc_pg'
    `);
    updateStmt.run(tatiEarned);

    const balanceRow: any = db.prepare(`SELECT balance FROM Account WHERE id = 'acc_pg'`).get();
    console.log(`[Clearing House] Updated PG (acc_pg) Balance: ${balanceRow?.balance ?? 0} TATI`);
  } catch (err: any) {
    console.error(`[Database Error] Ledger update failed: ${err.message}`);
  }
}

if (require.main === module) {
  console.log('[Listener] Telemetry Ingestion Service active. Listening for meter transmissions...');
}