import { NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const TATI_USD_RATE = 197.50; // 1 TATI = 1 MWh = $197.50 USD

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { generatorId, kwhGenerated, timestamp, nonce, signature } = payload;

    if (!generatorId || kwhGenerated === undefined) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload parameters' },
        { status: 400 }
      );
    }

    const mwhGenerated = kwhGenerated / 1000;
    const tatiEarned = mwhGenerated;
    const usdValue = tatiEarned * TATI_USD_RATE;

    const dbPath = path.join(process.cwd(), 'prisma/dev.db');
    const db = new DatabaseSync(dbPath);

    // 1. Credit Power Generator balance in dev.db
    const updateStmt = db.prepare(`
      UPDATE Account 
      SET balance = balance + ?, updatedAt = DATETIME('now')
      WHERE id = 'acc_pg'
    `);
    updateStmt.run(tatiEarned);

    // 2. Insert audit log entry for settlement
    const txId = `CLR-${Math.floor(1000 + Math.random() * 9000)}`;
    const txHash = `0x${signature ? signature.substring(0, 10) : '00000000'}...${nonce ? nonce.substring(0, 4) : '0000'}`;

    db.exec(`
      CREATE TABLE IF NOT EXISTS AuditLedger (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        description TEXT,
        fromParty TEXT,
        toParty TEXT,
        amountUSD REAL,
        tatiTokens REAL,
        energyMWh REAL,
        status TEXT,
        txHash TEXT
      )
    `);

    const insertLedger = db.prepare(`
      INSERT INTO AuditLedger (id, timestamp, description, fromParty, toParty, amountUSD, tatiTokens, energyMWh, status, txHash)
      VALUES (?, DATETIME('now'), ?, 'Distributor', 'Generator', ?, ?, ?, 'SETTLED', ?)
    `);
    insertLedger.run(
      txId,
      `Smart Meter Ingestion (${generatorId})`,
      usdValue,
      tatiEarned,
      mwhGenerated,
      txHash
    );

    const updatedPgRow: any = db.prepare(`SELECT balance FROM Account WHERE id = 'acc_pg'`).get();
    db.close();

    console.log(`[API /api/tati] Ingested ${kwhGenerated} kWh from ${generatorId}. New PG Balance: ${updatedPgRow?.balance} TATI`);

    return NextResponse.json({
      success: true,
      message: 'Telemetry payload processed successfully',
      clearingHouse: {
        accountId: 'acc_pg',
        kwhIngested: kwhGenerated,
        tatiEarned,
        newBalance: updatedPgRow?.balance ?? 0,
        usdValuation: usdValue
      }
    });
  } catch (error: any) {
    console.error('[API /api/tati Error]:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}