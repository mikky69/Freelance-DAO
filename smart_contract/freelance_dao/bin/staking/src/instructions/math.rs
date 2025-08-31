// programs/staking/src/events.rs
use anchor_lang::prelude::*;

#[event]
pub struct Staked {
    pub pool: Pubkey,
    pub staker: Pubkey,
    pub amount: u64,
    pub new_total: u64,
    pub timestamp: i64,
}

#[event]
pub struct Unstaked {
    pub pool: Pubkey,
    pub staker: Pubkey,
    pub amount: u64,
    pub remaining: u64,
    pub timestamp: i64,
}

#[event]
pub struct PointsAccrued {
    pub pool: Pubkey,
    pub staker: Pubkey,
    pub delta_points: u128,
    pub total_points: u128,
    pub timestamp: i64,
}

#[event]
pub struct PointsExchanged {
    pub staker: Pubkey,
    pub points_burned: u128,
    pub fldao_minted: u64,
    pub exchange_rate: u64,
    pub timestamp: i64,
}

// programs/staking/src/math.rs
use anchor_lang::prelude::*;
use crate::errors::StakingError;

// Q32.32 fixed point for precise points calculation
pub const Q32: u64 = 1u64 << 32;

pub fn calculate_points_accrued(
    amount: u64,
    rate_per_second: u64,  // Q32.32 format
    duration_seconds: i64,
) -> Result<u128> {
    if duration_seconds < 0 {
        return Ok(0);
    }
    
    let duration = duration_seconds as u128;
    let amount_expanded = amount as u128;
    let rate_expanded = rate_per_second as u128;
    
    // points = (amount * rate * duration) / Q32
    let points = amount_expanded
        .checked_mul(rate_expanded)
        .ok_or(StakingError::MathOverflow)?
        .checked_mul(duration)
        .ok_or(StakingError::MathOverflow)?
        .checked_div(Q32 as u128)
        .ok_or(StakingError::MathOverflow)?;
        
    Ok(points)
}

pub fn points_to_fldao(points: u128, exchange_rate: u64) -> Result<u64> {
    if exchange_rate == 0 {
        return Err(StakingError::InvalidExchangeRate.into());
    }
    
    let fldao_amount = points
        .checked_div(exchange_rate as u128)
        .ok_or(StakingError::MathOverflow)?;
        
    if fldao_amount > u64::MAX as u128 {
        return Err(StakingError::MathOverflow.into());
    }
    
    Ok(fldao_amount as u64)
}
