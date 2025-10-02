use crate::errors::ErrorCode;
use crate::state_accounts::DaoConfig;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitDaoConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = DaoConfig::SPACE,
        seeds = [b"dao_config"],
        bump
    )]
    pub dao_config: Account<'info, DaoConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn init_dao_config(
    ctx: Context<InitDaoConfig>,
    light_fee_usdc: u64,
    major_fee_usdc: u64,
    vote_fee_lamports: u64,
    min_vote_duration: i64,
    max_vote_duration: i64,
    eligibility_flags: u8,
    quorum_threshold: u64,
    approval_threshold: u64,
) -> Result<()> {
    // Validate input parameters
    if min_vote_duration >= max_vote_duration || min_vote_duration <= 0 {
        return Err(ErrorCode::InvalidWindow.into());
    }

    use crate::constants::{ABSOLUTE_MIN_VOTE_DURATION, MAX_QUORUM_THRESHOLD};

    if approval_threshold < 100 || approval_threshold > 10000 {
        return Err(ErrorCode::InvalidWindow.into());
    }

    // ADD THIS:
    if quorum_threshold > MAX_QUORUM_THRESHOLD {
        return Err(ErrorCode::InvalidWindow.into()); // Or create InvalidThreshold error
    }

    if min_vote_duration < ABSOLUTE_MIN_VOTE_DURATION {
        return Err(ErrorCode::InvalidWindow.into());
    }

    let dao_config = &mut ctx.accounts.dao_config;

    // Initialize all fields explicitly
    dao_config.admin = ctx.accounts.admin.key();
    dao_config.light_fee_usdc = light_fee_usdc;
    dao_config.major_fee_usdc = major_fee_usdc;
    dao_config.vote_fee_lamports = vote_fee_lamports;
    dao_config.min_vote_duration = min_vote_duration;
    dao_config.max_vote_duration = max_vote_duration;
    dao_config.eligibility_flags = eligibility_flags;
    dao_config.quorum_threshold = quorum_threshold;
    dao_config.approval_threshold = approval_threshold;
    dao_config.proposal_count = 0;
    dao_config.paused = false;
    dao_config.weight_params = 1_000_000_000; // Default weight divisor
    dao_config.bump = ctx.bumps.dao_config;

    // Treasury and staking fields will be set when they are initialized
    dao_config.usdc_mint = Pubkey::default();
    dao_config.treasury = Pubkey::default();
    dao_config.usdc_treasury = Pubkey::default();
    dao_config.staking_treasury = Pubkey::default();

    msg!("DAO Config initialized successfully");
    msg!("Admin: {}", dao_config.admin);
    msg!("Light fee: {} USDC", dao_config.light_fee_usdc);
    msg!("Major fee: {} USDC", dao_config.major_fee_usdc);
    msg!("Vote fee: {} lamports", dao_config.vote_fee_lamports);
    msg!("Proposal count: {}", dao_config.proposal_count);

    Ok(())
}
