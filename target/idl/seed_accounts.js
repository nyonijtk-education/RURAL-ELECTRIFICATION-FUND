const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TATI_USD_RATE = 197.50; // 1 TATI = 1 MWh = $197.50 USD

async function main() {
  console.log('Starting REOS 4-Party Clearing House Ledger Seeding...');

  // 1. Clear existing accounts & ledger entries for a clean setup
  await prisma.ledgerTransaction.deleteMany({});
  await prisma.account.deleteMany({});

  // 2. Pre-seed the 4-Party Clearing House Accounts
  const clearingHouse = await prisma.account.create({
    data: {
      accountNumber: 'ACC-REF-CLEARING-01',
      name: 'REF Accounting Clearing House (ACC)',
      role: 'CLEARING_HOUSE',
      balanceTati: 10000.00, // Reserve pool for initial liquidity
      balanceUsd: 10000.00 * TATI_USD_RATE,
      status: 'ACTIVE',
    },
  });

  const powerGenerator = await prisma.account.create({
    data: {
      accountNumber: 'PG-MUTARE-HYDRO-01',
      name: 'Mutare Micro-Hydro Station (PG)',
      role: 'POWER_GENERATOR',
      balanceTati: 0.00,
      balanceUsd: 0.00,
      status: 'ACTIVE',
    },
  });

  const powerDistributor = await prisma.account.create({
    data: {
      accountNumber: 'PD-MANICALAND-GRID-01',
      name: 'Manicaland Distribution Network (PD)',
      role: 'POWER_DISTRIBUTOR',
      balanceTati: 500.00, // Pre-funded operational credit
      balanceUsd: 500.00 * TATI_USD_RATE,
      status: 'ACTIVE',
    },
  });

  const consumerPool = await prisma.account.create({
    data: {
      accountNumber: 'C-NYANGA-COMMUNITY-01',
      name: 'Nyanga Rural Consumer Pool (C)',
      role: 'CONSUMER',
      balanceTati: 50.00, // Initial prepayment token purchases
      balanceUsd: 50.00 * TATI_USD_RATE,
      status: 'ACTIVE',
    },
  });

  const equipmentVendor = await prisma.account.create({
    data: {
      accountNumber: 'VEN-STARBRIDGE-ENG-01',
      name: 'Starbridge Engineering (Equipment Vendor)',
      role: 'EQUIPMENT_VENDOR',
      balanceTati: 0.00,
      balanceUsd: 0.00,
      status: 'ACTIVE',
    },
  });

  console.log('Pre-seeded Accounts Created Successfully:');
  console.table([
    { ID: clearingHouse.accountNumber, Role: clearingHouse.role, Balance_TATI: clearingHouse.balanceTati, Balance_USD: `$${clearingHouse.balanceUsd.toLocaleString()}` },
    { ID: powerGenerator.accountNumber, Role: powerGenerator.role, Balance_TATI: powerGenerator.balanceTati, Balance_USD: `$${powerGenerator.balanceUsd.toLocaleString()}` },
    { ID: powerDistributor.accountNumber, Role: powerDistributor.role, Balance_TATI: powerDistributor.balanceTati, Balance_USD: `$${powerDistributor.balanceUsd.toLocaleString()}` },
    { ID: consumerPool.accountNumber, Role: consumerPool.role, Balance_TATI: consumerPool.balanceTati, Balance_USD: `$${consumerPool.balanceUsd.toLocaleString()}` },
    { ID: equipmentVendor.accountNumber, Role: equipmentVendor.role, Balance_TATI: equipmentVendor.balanceTati, Balance_USD: `$${equipmentVendor.balanceUsd.toLocaleString()}` },
  ]);

  // 3. Log initial genesis transaction in the ledger
  await prisma.ledgerTransaction.create({
    data: {
      reference: 'GENESIS-REOS-2026',
      senderId: clearingHouse.id,
      receiverId: powerDistributor.id,
      amountTati: 500.00,
      amountUsd: 500.00 * TATI_USD_RATE,
      description: 'Genesis liquidity provision for Manicaland Power Distributor',
      timestamp: new Date(),
    },
  });

  console.log('Genesis ledger transaction logged successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding ledger accounts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });