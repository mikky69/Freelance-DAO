use anchor_lang::prelude::*;
use crate::{accounts::*, constants::*, errors::ErrorCode};

#[derive(Accounts)]
pub struct InitDaoConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 32 + 1 + 1,
        seeds = [DAO_CONFIG_SEED],
        bump
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub usdc_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = usdc_mint,
        associated_token::authority = dao_config
    )]
    pub fee_wallet: Account<'info, anchor_spl::token::TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
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
    let dao_config = &mut ctx.accounts.dao_config;
    dao_config.usdc_mint = ctx.accounts.usdc_mint.key();
    dao_config.fee_wallet = ctx.accounts.fee_wallet.key();
    dao_config.light_fee_usdc = light_fee_usdc;
    dao_config.major_fee_usdc = major_fee_usdc;
    dao_config.vote_fee_lamports = vote_fee_lamports;
    dao_config.min_vote_duration = min_vote_duration;
    dao_config.max_vote_duration = max_vote_duration;
    dao_config.admin = ctx.accounts.admin.key();
    dao_config.eligibility_flags = eligibility_flags;
    dao_config.paused = false;
    dao_config.bump = ctx.bumps.dao_config;
    Ok(())
}