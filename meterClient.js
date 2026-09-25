const crypto = require('crypto');

const TARGET_URL = 'http://localhost:3000/api/tati';
const GENERATOR_ID = 'GEN-MUTARE-001';

// Generate standard KeyObjects for ECDSA signing (secp256k1)
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1',
});

// Export Public Key to hex for display and payload transmission
const pubKeyHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');

function createTelemetryPayload(kwh) {
  const timestamp = new Date().toISOString();
  const nonce = crypto.randomBytes(8).toString('hex');

  // String message format to sign
  const messageData = `${GENERATOR_ID}:${kwh}:${timestamp}:${nonce}`;

  // Sign message directly using the privateKey KeyObject
  const sign = crypto.createSign('SHA256');
  sign.update(messageData);
  sign.end();
  const signatureHex = sign.sign(privateKey, 'hex');

  return {
    generatorId: GENERATOR_ID,
    kwhGenerated: kwh,
    timestamp,
    nonce,
    signature: signatureHex,
    publicKey: pubKeyHex,
  };
}

async function sendTelemetry() {
  console.log('--- SMART METER CONFIGURATION ---');
  console.log(`Generator ID: ${GENERATOR_ID}`);
  console.log(`Registered Public Key (HEX):\n${pubKeyHex.substring(0, 64)}...\n`);

  const payload = createTelemetryPayload(85.4);

  console.log('Sending signed payload to Tati Rewards API:');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(TARGET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('\nTransmission Success!');
    console.log('API Response:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`\nTransmission failed: ${err.message}`);
  }
}

sendTelemetry();