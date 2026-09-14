const crypto = require('crypto');

// Simulate hardware setup: Load the meter's stored private key
// (In production, generate this once and secure it in hardware/HSM)
const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

// Public key exported in DER-HEX format for backend registration
const METER_PUBLIC_KEY_HEX = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
const GENERATOR_ID = "GEN-MUTARE-001";

console.log("--- SMART METER CONFIGURATION ---");
console.log(`Generator ID: ${GENERATOR_ID}`);
console.log(`Registered Public Key (HEX):\n${METER_PUBLIC_KEY_HEX}\n`);

/**
 * Creates and signs an energy payload.
 */
function createSignedPayload(kwhGenerated) {
  const timestamp = new Date().toISOString();
  const nonce = crypto.randomBytes(8).toString('hex');

  // The canonical message string to sign (prevents key/field ordering ambiguity)
  const messageToSign = `${GENERATOR_ID}:${kwhGenerated}:${timestamp}:${nonce}`;

  // Sign using Ed25519 private key
  const signature = crypto.sign(null, Buffer.from(messageToSign), privateKey).toString('hex');

  return {
    generatorId: GENERATOR_ID,
    kwhGenerated,
    timestamp,
    nonce,
    signature
  };
}

// Simulate sending a verified meter reading to the API
async function sendTelemetry() {
  const payload = createSignedPayload(85.4); // 85.4 kWh generated

  console.log("Sending signed payload to Tati Rewards API:");
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('http://localhost:3001/api/energy/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("\nBackend Response:", result);
  } catch (err) {
    console.error("Transmission failed:", err.message);
  }
}

sendTelemetry();