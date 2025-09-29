use crate::{
    errors::StakingError,
    events::{PoolInitialized, RewardsConfigInitialized},
    state_accounts::{RewardsConfig, StakePool},
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct InitRewardsConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = RewardsConfig::SPACE,
        seeds = [b"rewards_config"],
        bump
    )]
    pub rewards_config: Account<'info, RewardsConfig>,
    /// CHECK: This is the mint authority PDA
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    /// CHECK: This is the treasury PDA
    #[account(
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: UncheckedAccount<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn init_rewards_config(
    ctx: Context<InitRewardsConfig>,
    fl_dao_mint: Pubkey,
    exchange_rate: u64,
    admin: Pubkey,
) -> Result<()> {
    require!(exchange_rate > 0, StakingError::InvalidExchangeRate);
    require!(admin != Pubkey::default(), StakingError::Unauthorized);
    require!(fl_dao_mint != Pubkey::default(), StakingError::InvalidMint);

    let rewards_config = &mut ctx.accounts.rewards_config;
    let clock = Clock::get()?;

    rewards_config.admin = admin;
    rewards_config.fl_dao_mint = fl_dao_mint;
    rewards_config.exchange_rate = exchange_rate;
    rewards_config.treasury = ctx.accounts.treasury.key();
    rewards_config.mint_authority = ctx.accounts.mint_authority.key();
    rewards_config.global_points_issued = 0;
    rewards_config.global_fldao_minted = 0;
    rewards_config.paused = false;
    rewards_config.bump = ctx.bumps.rewards_config;

    emit!(RewardsConfigInitialized {
        admin,
        fl_dao_mint,
        exchange_rate,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct InitPool<'info> {
    #[account(
        init,
        payer = admin,
        space = StakePool::SPACE,
        seeds = [b"pool", mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, StakePool>,
    #[account(
        init,
        payer = admin,
        token::mint = mint,
        token::authority = pool,
        seeds = [b"vault", mint.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn init_pool(
    ctx: Context<InitPool>,
    mint: Pubkey,
    is_lp: bool,
    points_per_token_per_second: u64,
    max_stake_per_user: u64, // ADD THIS PARAMETER
) -> Result<()> {
    require!(points_per_token_per_second > 0, StakingError::InvalidAmount);
    require!(max_stake_per_user > 0, StakingError::InvalidAmount);
    require!(mint != Pubkey::default(), StakingError::InvalidMint);

    let pool = &mut ctx.accounts.pool;
    let clock = Clock::get()?;

    pool.mint = mint;
    pool.vault = ctx.accounts.vault.key();
    pool.is_lp = is_lp;
    pool.points_per_token_per_second = points_per_token_per_second;
    pool.total_staked = 0;
    pool.total_points_issued = 0;
    pool.created_at = clock.unix_timestamp;
    pool.paused = false;
    pool.bump = ctx.bumps.pool;
    pool.max_stake_per_user = max_stake_per_user; // ADD THIS

    emit!(PoolInitialized {
        pool: pool.key(),
        mint,
        is_lp,
        points_per_token_per_second,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
