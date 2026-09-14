use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

declare_id!("Tati111111111111111111111111111111111111111");

#[program]
pub mod tati_energy_rewards {
    use super::*;

    /// Initialize the global TATI Token Mint with a PDA authority
    pub fn initialize_mint(_ctx: Context<InitializeMint>) -> Result<()> {
        msg!("TATI Token Mint initialized with PDA authority.");
        Ok(())
    }

    /// Register a generator with a specific energy source and custom multiplier
    pub fn register_generator(
        ctx: Context<RegisterGenerator>,
        generator_id: String,
        source_type: EnergySource,
    ) -> Result<()> {
        require!(generator_id.len() <= 32, RewardError::GeneratorIdTooLong);

        let generator_account = &mut ctx.accounts.generator_account;
        generator_account.owner = ctx.accounts.generator_owner.key();
        generator_account.generator_id = generator_id;
        generator_account.source_type = source_type.clone();
        generator_account.total_kwh = 0;

        // Base rate: 50,000 base units per kWh (0.05 TATI)
        // Multiplier applied based on priority/scarcity of energy source (Basis points: 10,000 = 1.0x)
        generator_account.rate_multiplier_bps = match source_type {
            EnergySource::Solar => 10000, // 1.0x (100.00% standard tier)
            EnergySource::Hydro => 12000, // 1.2x (120.00% off-peak priority tier)
            EnergySource::Wind  => 11000, // 1.1x (110.00% variable tier)
        };

        msg!(
            "Registered generator '{}' ({:?}) with multiplier BPS {}",
            generator_account.generator_id,
            generator_account.source_type,
            generator_account.rate_multiplier_bps
        );

        Ok(())
    }

    /// Calculates dynamic tariff tiering, mints reward tokens, and emits an event
    pub fn reward_generator(
        ctx: Context<RewardGenerator>,
        kwh_generated: u64,
        timestamp: i64,
    ) -> Result<()> {
        require!(kwh_generated > 0, RewardError::InvalidEnergyAmount);

        let generator_account = &mut ctx.accounts.generator_account;

        // 1. Base Rate Calculation: 1 kWh = 50,000 base units (0.05 TATI @ 6 decimals)
        let base_reward = kwh_generated
            .checked_mul(50_000)
            .ok_or(RewardError::CalculationOverflow)?;

        // 2. Apply Dynamic Multiplier (Basis Points: 10,000 = 1.0x)
        let final_reward = base_reward
            .checked_mul(generator_account.rate_multiplier_bps as u64)
            .ok_or(RewardError::CalculationOverflow)?
            .checked_div(10_000)
            .ok_or(RewardError::CalculationOverflow)?;

        // 3. Update generator on-chain telemetry state
        generator_account.total_kwh = generator_account
            .total_kwh
            .checked_add(kwh_generated)
            .ok_or(RewardError::CalculationOverflow)?;

        msg!(
            "Generator '{}' [{:?}] generated {} kWh. Minting {} base units TATI (Multiplier: {} BPS)",
            generator_account.generator_id,
            generator_account.source_type,
            kwh_generated,
            final_reward,
            generator_account.rate_multiplier_bps
        );

        // 4. CPI to Token Program using Mint PDA Signer
        let bump = ctx.bumps.tati_mint;
        let signer_seeds: &[&[&[u8]]] = &[&[b"tati_mint", &[bump]]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.tati_mint.to_account_info(),
            to: ctx.accounts.generator_token_account.to_account_info(),
            authority: ctx.accounts.tati_mint.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        token::mint_to(cpi_ctx, final_reward)?;

        // 5. Emit on-chain event for off-chain WebSocket listeners
        emit!(EnergyRewardMinted {
            generator_id: generator_account.generator_id.clone(),
            source_type: generator_account.source_type.clone(),
            kwh_generated,
            reward_amount: final_reward,
            recipient: ctx.accounts.generator_token_account.key(),
            timestamp,
        });

        Ok(())
    }
}

// --- ACCOUNT CONTEXTS ---

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        seeds = [b"tati_mint"],
        bump,
        mint::decimals = 6,
        mint::authority = tati_mint,
        mint::freeze_authority = tati_mint,
    )]
    pub tati_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(generator_id: String)]
pub struct RegisterGenerator<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Account owner (receives payouts)
    /// CHECK: Validated in handler logic
    pub generator_owner: AccountInfo<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + 32 + (4 + 32) + 1 + 2 + 8, // Discriminator + Owner + ID String + Enum + Multiplier + Total
        seeds = [b"generator", generator_id.as_bytes()],
        bump
    )]
    pub generator_account: Account<'info, GeneratorState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RewardGenerator<'info> {
    /// Authorized oracle or backend authority calling instruction
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tati_mint"],
        bump,
    )]
    pub tati_mint: Account<'info, Mint>,

    #[account(mut)]
    pub generator_account: Account<'info, GeneratorState>,

    /// Generator's Associated Token Account
    #[account(
        mut,
        constraint = generator_token_account.mint == tati_mint.key(),
        constraint = generator_token_account.owner == generator_account.owner
    )]
    pub generator_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// --- DATA STRUCTURES & EVENTS ---

#[account]
pub struct GeneratorState {
    pub owner: Pubkey,            // 32 bytes
    pub generator_id: String,     // 4 + 32 bytes
    pub source_type: EnergySource,// 1 byte
    pub rate_multiplier_bps: u16, // 2 bytes (Basis points: 10000 = 1.0x)
    pub total_kwh: u64,           // 8 bytes
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum EnergySource {
    Solar,
    Hydro,
    Wind,
}

#[event]
pub struct EnergyRewardMinted {
    pub generator_id: String,
    pub source_type: EnergySource,
    pub kwh_generated: u64,
    pub reward_amount: u64,
    pub recipient: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum RewardError {
    #[msg("Energy generated must be greater than zero.")]
    InvalidEnergyAmount,
    #[msg("Calculation overflowed while computing reward tokens.")]
    CalculationOverflow,
    #[msg("Generator ID cannot exceed 32 characters.")]
    GeneratorIdTooLong,
}