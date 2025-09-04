use anchor_lang::prelude::*;
use crate::{state_accounts::{RewardsConfig, StakePool}, errors::StakingError};

#[derive(Accounts)]
pub struct SetPoolParams<'info> {
    #[account(
        seeds = [b"rewards_config"],
        bump = rewards_config.bump,
        has_one = admin @ StakingError::Unauthorized
    )]
    pub rewards_config: Account<'info, RewardsConfig>,
    #[account(mut)]
    pub pool: Account<'info, StakePool>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetRewardsParams<'info> {
    #[account(
        mut,
        seeds = [b"rewards_config"],
        bump = rewards_config.bump,
        has_one = admin @ StakingError::Unauthorized
    )]
    pub rewards_config: Account<'info, RewardsConfig>,
    pub admin: Signer<'info>,
}

pub fn set_pool_params(ctx: Context<SetPoolParams>, rate: Option<u64>, paused: Option<bool>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    
    if let Some(new_rate) = rate {
        pool.points_per_token_per_second = new_rate;
    }
    
    if let Some(pause_state) = paused {
        pool.paused = pause_state;
    }
    
    Ok(())
}

pub fn set_rewards_params(ctx: Context<SetRewardsParams>, exchange_rate: Option<u64>, paused: Option<bool>) -> Result<()> {
    let rewards_config = &mut ctx.accounts.rewards_config;
    
    if let Some(new_rate) = exchange_rate {
        rewards_config.exchange_rate = new_rate;
    }
    
    if let Some(pause_state) = paused {
        rewards_config.paused = pause_state;
    }
    
    Ok(())
}