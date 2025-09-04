// programs/staking/src/instructions/staking.rs
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state_accounts::{StakePool, StakePosition};
use crate::errors::StakingError;
use crate::events::{Staked, Unstaked};
use crate::utils::update_position_points;

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub pool: Account<'info, StakePool>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = staker,
        space = StakePosition::SPACE,
        seeds = [b"position", pool.key().as_ref(), staker.key().as_ref()],
        bump
    )]
    pub position: Account<'info, StakePosition>,
    #[account(mut)]
    pub staker: Signer<'info>,
    #[account(mut)]
    pub staker_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// programs/staking/src/instructions/staking.rs (stake function only)
pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let position = &mut ctx.accounts.position;
    let clock = Clock::get()?;
    
    if pool.paused {
        return Err(StakingError::PoolPaused.into());
    }
    
    if amount == 0 {
        return Err(StakingError::AmountTooSmall.into());
    }
    
    // Update points before changing stake amount
    update_position_points(position, pool, clock.unix_timestamp)?;
    
    // Initialize position if first stake
    if position.staker == Pubkey::default() {
        position.staker = ctx.accounts.staker.key();
        position.pool = pool.key();
        position.amount = 0;
        position.accum_points = 0;
        position.created_at = clock.unix_timestamp;
        position.last_update_ts = clock.unix_timestamp;
        position.bump = ctx.bumps.position; // Use ctx.bumps directly
    }
    
    // Transfer tokens to vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.staker_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.staker.to_account_info(),
            },
        ),
        amount,
    )?;
    
    // Update amounts
    position.amount = position.amount
        .checked_add(amount)
        .ok_or(StakingError::MathOverflow)?;
        
    pool.total_staked = pool.total_staked
        .checked_add(amount)
        .ok_or(StakingError::MathOverflow)?;
    
    emit!(Staked {
        pool: pool.key(),
        staker: position.staker,
        amount,
        new_total: position.amount,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub pool: Account<'info, StakePool>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        has_one = staker @ StakingError::Unauthorized,
        has_one = pool @ StakingError::InvalidPool
    )]
    pub position: Account<'info, StakePosition>,
    #[account(mut)]
    pub staker: Signer<'info>,
    #[account(mut)]
    pub staker_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let position = &mut ctx.accounts.position;
    let clock = Clock::get()?;
    
    if amount == 0 {
        return Err(StakingError::AmountTooSmall.into());
    }
    
    if position.amount < amount {
        return Err(StakingError::InsufficientStaked.into());
    }
    
    // Update points before changing stake amount
    update_position_points(position, pool, clock.unix_timestamp)?;
    
    // Transfer tokens back to user
    let pool_seeds = &[
        b"pool",
        pool.mint.as_ref(),
        &[pool.bump],
    ];
    
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.staker_token_account.to_account_info(),
                authority: pool.to_account_info(),
            },
            &[pool_seeds],
        ),
        amount,
    )?;
    
    // Update amounts
    position.amount = position.amount
        .checked_sub(amount)
        .ok_or(StakingError::MathOverflow)?;
        
    pool.total_staked = pool.total_staked
        .checked_sub(amount)
        .ok_or(StakingError::MathOverflow)?;
    
    emit!(Unstaked {
        pool: pool.key(),
        staker: position.staker,
        amount,
        remaining: position.amount,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct SyncPosition<'info> {
    pub pool: Account<'info, StakePool>,
    #[account(
        mut,
        has_one = staker @ StakingError::Unauthorized,
        has_one = pool @ StakingError::InvalidPool
    )]
    pub position: Account<'info, StakePosition>,
    pub staker: Signer<'info>,
}

pub fn sync_position(ctx: Context<SyncPosition>) -> Result<()> {
    let pool = &ctx.accounts.pool;
    let position = &mut ctx.accounts.position;
    let clock = Clock::get()?;
    
    let points_earned = update_position_points(position, pool, clock.unix_timestamp)?;
    
    if points_earned > 0 {
        emit!(crate::events::PointsAccrued {
            pool: pool.key(),
            staker: position.staker,
            delta_points: points_earned,
            total_points: position.accum_points,
            timestamp: clock.unix_timestamp,
        });
    }
    
    Ok(())
}