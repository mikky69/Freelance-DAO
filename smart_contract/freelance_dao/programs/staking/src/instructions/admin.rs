use crate::{
    errors::StakingError,
    state_accounts::{RewardsConfig, StakePool},
};
use anchor_lang::prelude::*;

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

pub fn set_pool_params(
    ctx: Context<SetPoolParams>,
    rate: Option<u64>,
    paused: Option<bool>,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let clock = Clock::get()?;

    if let Some(new_rate) = rate {
        require!(new_rate > 0, StakingError::InvalidAmount);
        pool.points_per_token_per_second = new_rate;
    }

    if let Some(pause_state) = paused {
        pool.paused = pause_state;
    }

    // Emit event for tracking
    emit!(crate::events::PoolParamsUpdated {
        pool: pool.key(),
        new_rate: rate,
        paused,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

pub fn set_rewards_params(
    ctx: Context<SetRewardsParams>,
    exchange_rate: Option<u64>,
    paused: Option<bool>,
) -> Result<()> {
    let rewards_config = &mut ctx.accounts.rewards_config;
    let clock = Clock::get()?;

    if let Some(new_rate) = exchange_rate {
        require!(new_rate > 0, StakingError::InvalidExchangeRate);
        rewards_config.exchange_rate = new_rate;
    }

    if let Some(pause_state) = paused {
        rewards_config.paused = pause_state;
    }

    // Emit event for tracking
    emit!(crate::events::RewardsParamsUpdated {
        new_exchange_rate: exchange_rate,
        paused,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
