// UPDATED init.rs
// ============================================
use anchor_lang::prelude::*;
use crate::state_accounts::DaoConfig;
use crate::errors::ErrorCode;

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
    if min_vote_duration >= max_vote_duration || min_vote_duration <= 0 {
        return Err(ErrorCode::InvalidWindow.into());
    }
    
    if approval_threshold < 100 || approval_threshold > 10000 {
        return Err(ErrorCode::InvalidWindow.into()); // Reusing for simplicity
    }

    let dao_config = &mut ctx.accounts.dao_config;
    dao_config.usdc_mint = Pubkey::default(); // Will be set when treasury is initialized
    dao_config.treasury = Pubkey::default();
    dao_config.usdc_treasury = Pubkey::default();
    dao_config.light_fee_usdc = light_fee_usdc;
    dao_config.major_fee_usdc = major_fee_usdc;
    dao_config.vote_fee_lamports = vote_fee_lamports;
    dao_config.min_vote_duration = min_vote_duration;
    dao_config.max_vote_duration = max_vote_duration;
    dao_config.admin = ctx.accounts.admin.key();
    dao_config.eligibility_flags = eligibility_flags;
    dao_config.paused = false;
    dao_config.proposal_count = 0;
    dao_config.weight_params = 1_000_000_000; // 1 billion = 1 vote weight per 1 $FLDAO
    dao_config.quorum_threshold = quorum_threshold;
    dao_config.approval_threshold = approval_threshold; // e.g., 5100 = 51%
    dao_config.bump = ctx.bumps.dao_config;

    Ok(())
}