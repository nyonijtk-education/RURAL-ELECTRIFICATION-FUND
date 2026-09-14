import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TatiEnergyRewards } from "../target/types/tati_energy_rewards";
import idl from "../target/idl/tati_energy_rewards.json";

async function main() {
  // 1. Establish RPC & WebSocket Connection (e.g., Localhost or Devnet)
  const connection = new anchor.web3.Connection(
    "http://127.0.0.1:8899",
    {
      commitment: "confirmed",
      wsEndpoint: "ws://127.0.0.1:8900",
    }
  );

  // Read-only wallet for the listener service
  const wallet = new anchor.Wallet(anchor.web3.Keypair.generate());
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // 2. Initialize Program Client with IDL
  const program = new Program(
    idl as anchor.Idl,
    provider
  ) as Program<TatiEnergyRewards>;

  console.log("⚡ [Tati Off-Chain Service] Listening for EnergyRewardMinted events...");

  // 3. Subscribe to program events
  const listenerId = program.addEventListener(
    "energyRewardMinted",
    (event, slot, signature) => {
      const rewardUiAmount = (event.rewardAmount.toNumber() / 1_000_000).toFixed(6);
      const formattedTime = new Date(event.timestamp.toNumber() * 1000).toISOString();

      console.log("\n==================================================");
      console.log(`📡 REAL-TIME EVENT DETECTED (Slot: ${slot})`);
      console.log(`Tx Signature : ${signature}`);
      console.log(`Generator ID : ${event.generatorId}`);
      console.log(`Source Type  : ${Object.keys(event.sourceType)[0].toUpperCase()}`);
      console.log(`Energy Output: ${event.kwhGenerated.toString()} kWh`);
      console.log(`Minted Reward: +${rewardUiAmount} TATI`);
      console.log(`Recipient ATA: ${event.recipient.toBase58()}`);
      console.log(`Timestamp    : ${formattedTime}`);
      console.log("==================================================");

      // Trigger secondary pipelines (e.g. update Postgres DB, send SMS alerts)
    }
  );

  // Graceful shutdown on SIGINT
  process.on("SIGINT", async () => {
    console.log("\nUnsubscribing from event listener...");
    await program.removeEventListener(listenerId);
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Listener error:", err);
});