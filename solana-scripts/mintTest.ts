import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TatiEnergyRewards } from "../target/types/tati_energy_rewards";
import { 
  getAssociatedTokenAddressSync, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID 
} from "@solana/spl-token";

describe("Tati Energy Rewards On-Chain Test", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TatiEnergyRewards as Program<TatiEnergyRewards>;

  // Derive Mint PDA
  const [tatiMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("tati_mint")],
    program.programId
  );

  it("Initializes the TATI Mint Account with PDA Authority", async () => {
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

    console.log("TATI Mint PDA Address:", tatiMintPda.toBase58());
  });

  it("Mints verified rewards to a generator on-chain", async () => {
    const generatorWallet = anchor.web3.Keypair.generate().publicKey;

    // Derive ATA for the generator
    const generatorAta = getAssociatedTokenAddressSync(
      tatiMintPda,
      generatorWallet
    );

    // Create ATA if it doesn't exist
    const createAtaTx = new anchor.web3.Transaction().add(
      createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        generatorAta,
        generatorWallet,
        tatiMintPda
      )
    );
    await provider.sendAndConfirm(createAtaTx);

    // Submit 120 kWh reading -> program mints 6.00 TATI (6,000,000 base units)
    const kwhAmount = new anchor.BN(120);
    const timestamp = new anchor.BN(Math.floor(Date.now() / 1000));

    const txSig = await program.methods
      .rewardGenerator(kwhAmount, timestamp)
      .accounts({
        authority: provider.wallet.publicKey,
        tatiMint: tatiMintPda,
        generatorTokenAccount: generatorAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Reward Transaction Signature:", txSig);
  });
});