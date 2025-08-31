// programs/staking/src/instructions/init.rs
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::state_accounts::{RewardsConfig, StakePool};
use crate::errors::StakingError;

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
    let rewards_config = &mut ctx.accounts.rewards_config;
    
    rewards_config.admin = admin;
    rewards_config.fl_dao_mint = fl_dao_mint;
    rewards_config.exchange_rate = exchange_rate;
    rewards_config.treasury = Pubkey::default(); // Set later
    rewards_config.mint_authority = Pubkey::default(); // Set later  
    rewards_config.global_points_issued = 0;
    rewards_config.global_fldao_minted = 0;
    rewards_config.paused = false;
    rewards_config.bump = ctx.bumps.rewards_config;
    
    Ok(())
}

#[derive(Accounts)]
pub struct InitPool<'info> {
    #[account(
        seeds = [b"rewards_config"],
        bump = rewards_config.bump,
        has_one = admin @ StakingError::Unauthorized
    )]
    pub rewards_config: Account<'info, RewardsConfig>,
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
        seeds = [b"vault", pool.key().as_ref()],
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
) -> Result<()> {
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
    
    Ok(())
}