import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TatiEnergyRewards } from "../target/types/tati_energy_rewards";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("Tati Energy Rewards - Tariff Multiplier Cycle", () => {
  // Configure the local cluster provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TatiEnergyRewards as Program<TatiEnergyRewards>;

  // Derive global TATI Token Mint PDA
  const [tatiMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("tati_mint")],
    program.programId
  );

  // Keypairs representing solar & hydro facility operators
  const solarOwner = anchor.web3.Keypair.generate();
  const hydroOwner = anchor.web3.Keypair.generate();

  const solarGenId = "GEN-MUTARE-SOLAR-01";
  const hydroGenId = "GEN-CHIPINGE-HYDRO-02";

  // Derive Generator State PDAs
  const [solarAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("generator"), Buffer.from(solarGenId)],
    program.programId
  );

  const [hydroAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("generator"), Buffer.from(hydroGenId)],
    program.programId
  );

  // Associated Token Accounts (ATAs) for payout
  let solarAta: anchor.web3.PublicKey;
  let hydroAta: anchor.web3.PublicKey;

  before(async () => {
    // 1. Airdrop SOL to generator owners to cover rent/ATA fees
    const sig1 = await provider.connection.requestAirdrop(solarOwner.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    const sig2 = await provider.connection.requestAirdrop(hydroOwner.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    
    await provider.connection.confirmTransaction(sig1);
    await provider.connection.confirmTransaction(sig2);

    // 2. Initialize TATI Mint Account (if uninitialized)
    try {
      await program.methods
        .initializeMint()
        .accounts({
          payer: provider.wallet.publicKey,
          tatiMint: tatiMintPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();
      console.log("Initialized TATI Mint PDA:", tatiMintPda.toBase58());
    } catch (e) {
      console.log("TATI Mint already initialized.");
    }

    // 3. Derive and create ATAs for both generator owners
    solarAta = getAssociatedTokenAddressSync(tatiMintPda, solarOwner.publicKey);
    hydroAta = getAssociatedTokenAddressSync(tatiMintPda, hydroOwner.publicKey);

    const setupAtaTx = new anchor.web3.Transaction().add(
      createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        solarAta,
        solarOwner.publicKey,
        tatiMintPda
      ),
      createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        hydroAta,
        hydroOwner.publicKey,
        tatiMintPda
      )
    );

    await provider.sendAndConfirm(setupAtaTx);
  });

  it("Registers Solar Generator (1.0x / 10,000 BPS)", async () => {
    await program.methods
      .registerGenerator(solarGenId, { solar: {} })
      .accounts({
        authority: provider.wallet.publicKey,
        generatorOwner: solarOwner.publicKey,
        generatorAccount: solarAccountPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.generatorState.fetch(solarAccountPda);
    assert.equal(state.generatorId, solarGenId);
    assert.equal(state.rateMultiplierBps, 10000);
    console.log(`Registered Solar Generator PDA (${solarGenId})`);
  });

  it("Registers Hydro Generator (1.2x / 12,000 BPS)", async () => {
    await program.methods
      .registerGenerator(hydroGenId, { hydro: {} })
      .accounts({
        authority: provider.wallet.publicKey,
        generatorOwner: hydroOwner.publicKey,
        generatorAccount: hydroAccountPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.generatorState.fetch(hydroAccountPda);
    assert.equal(state.generatorId, hydroGenId);
    assert.equal(state.rateMultiplierBps, 12000);
    console.log(`Registered Hydro Generator PDA (${hydroGenId})`);
  });

  it("Mints reward for Solar: 100 kWh -> 5.000000 TATI", async () => {
    const kwh = new anchor.BN(100);
    const timestamp = new anchor.BN(Math.floor(Date.now() / 1000));

    await program.methods
      .rewardGenerator(kwh, timestamp)
      .accounts({
        authority: provider.wallet.publicKey,
        tatiMint: tatiMintPda,
        generatorAccount: solarAccountPda,
        generatorTokenAccount: solarAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const tokenBalance = await provider.connection.getTokenAccountBalance(solarAta);
    // Base 100 kWh * 0.05 * 1.0x = 5.000000 TATI (5,000,000 base units)
    assert.equal(tokenBalance.value.amount, "5000000");
    console.log(`Solar Generator Received: ${tokenBalance.value.uiAmountString} TATI`);
  });

  it("Mints reward for Hydro: 100 kWh -> 6.000000 TATI (20% Premium)", async () => {
    const kwh = new anchor.BN(100);
    const timestamp = new anchor.BN(Math.floor(Date.now() / 1000));

    await program.methods
      .rewardGenerator(kwh, timestamp)
      .accounts({
        authority: provider.wallet.publicKey,
        tatiMint: tatiMintPda,
        generatorAccount: hydroAccountPda,
        generatorTokenAccount: hydroAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const tokenBalance = await provider.connection.getTokenAccountBalance(hydroAta);
    // Base 100 kWh * 0.05 * 1.2x = 6.000000 TATI (6,000,000 base units)
    assert.equal(tokenBalance.value.amount, "6000000");
    console.log(`Hydro Generator Received: ${tokenBalance.value.uiAmountString} TATI`);
  });
});