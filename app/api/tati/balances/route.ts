import { NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

export const dynamic = 'force-dynamic';

interface AccountRow {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'prisma/dev.db');
    const db = new DatabaseSync(dbPath);

    const accounts = db.prepare('SELECT id, name, type, balance FROM Account').all() as AccountRow[];
    
    let auditLogs: any[] = [];
    try {
      auditLogs = db.prepare('SELECT * FROM AuditLedger ORDER BY timestamp DESC LIMIT 10').all();
    } catch {
      auditLogs = [];
    }

    db.close();

    const balanceMap = accounts.reduce((acc, row) => {
      acc[row.id] = row.balance;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      balances: balanceMap,
      auditLogs,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}