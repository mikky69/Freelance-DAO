use anchor_lang::prelude::*;
use crate::state_accounts::DaoConfig;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[allow(unexpected_cfgs)]
pub struct InitDaoConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = DaoConfig::SPACE
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
) -> Result<()> {
    if min_vote_duration >= max_vote_duration || min_vote_duration <= 0 {
        return Err(ErrorCode::InvalidWindow.into());
    }

    let dao_config = &mut ctx.accounts.dao_config;
    // Set default values for treasury accounts - these will be updated later via admin functions
    dao_config.usdc_mint = Pubkey::default(); // Will be set later
    dao_config.treasury = Pubkey::default(); // Will be set later
    dao_config.usdc_treasury = Pubkey::default(); // Will be set later
    dao_config.light_fee_usdc = light_fee_usdc;
    dao_config.major_fee_usdc = major_fee_usdc;
    dao_config.vote_fee_lamports = vote_fee_lamports;
    dao_config.min_vote_duration = min_vote_duration;
    dao_config.max_vote_duration = max_vote_duration;
    dao_config.admin = ctx.accounts.admin.key();
    dao_config.eligibility_flags = eligibility_flags;
    dao_config.paused = false;
    dao_config.proposal_count = 0;
    dao_config.weight_params = 1_000_000_000;
    dao_config.bump = [0]; // Initialize with 0 since we don't have a PDA bump

    Ok(())
}