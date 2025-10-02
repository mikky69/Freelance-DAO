// programs/staking/src/math.rs
use crate::errors::StakingError;
use anchor_lang::prelude::*;

// Q32.32 fixed point for precise points calculation
pub const Q32: u64 = 1u64 << 32;

// Maximum duration to prevent overflow (10 years in seconds)
// This protects against: u64::MAX seconds (~584 billion years) causing overflow
pub const MAX_DURATION_SECONDS: i64 = 10 * 365 * 86400; // 315,360,000 seconds

// Maximum rate to prevent overflow in calculations
// With Q32 format: (2^32 = 4,294,967,296)
// This allows rates up to ~1000 tokens per token per second when properly scaled
pub const MAX_RATE_PER_SECOND: u64 = u64::MAX / 1000;

pub fn calculate_points_accrued(
    amount: u64,
    rate_per_second: u64, // Q32.32 format
    duration_seconds: i64,
) -> Result<u128> {
    // Handle negative or zero duration
    if duration_seconds <= 0 {
        return Ok(0);
    }

    // Cap duration to prevent overflow attacks
    // If someone stakes for 10+ years, they'll need to sync periodically
    let capped_duration = if duration_seconds > MAX_DURATION_SECONDS {
        MAX_DURATION_SECONDS
    } else {
        duration_seconds
    };

    let duration = capped_duration as u128;
    let amount_expanded = amount as u128;
    let rate_expanded = rate_per_second as u128;

    // Validate inputs before calculation
    require!(
        rate_per_second <= MAX_RATE_PER_SECOND,
        StakingError::InvalidAmount
    );

    // Calculate: points = (amount * rate * duration) / Q32
    // Break into steps to detect overflow early

    // Step 1: amount * rate
    let amount_times_rate = amount_expanded
        .checked_mul(rate_expanded)
        .ok_or(StakingError::MathOverflow)?;

    // Step 2: (amount * rate) * duration
    let numerator = amount_times_rate
        .checked_mul(duration)
        .ok_or(StakingError::MathOverflow)?;

    // Step 3: divide by Q32 to get final points
    let points = numerator
        .checked_div(Q32 as u128)
        .ok_or(StakingError::MathOverflow)?;

    Ok(points)
}

pub fn points_to_fldao(points: u128, exchange_rate: u64) -> Result<u64> {
    // Validate exchange rate
    require!(exchange_rate > 0, StakingError::InvalidExchangeRate);

    // Calculate FLDAO tokens: fldao = points / exchange_rate
    let fldao_amount = points
        .checked_div(exchange_rate as u128)
        .ok_or(StakingError::MathOverflow)?;

    // Ensure result fits in u64
    require!(fldao_amount <= u64::MAX as u128, StakingError::MathOverflow);

    Ok(fldao_amount as u64)
}

// Convert daily rate to per-second Q32.32 format
// daily_rate: tokens earned per token per day
// Returns: Q32.32 formatted rate per second
pub fn daily_rate_to_per_second(daily_rate: u64) -> Result<u64> {
    require!(daily_rate > 0, StakingError::InvalidAmount);

    // rate_per_second = (daily_rate * Q32) / 86400
    // Break into steps for safety
    let daily_rate_expanded = daily_rate as u128;
    let q32_expanded = Q32 as u128;

    let numerator = daily_rate_expanded
        .checked_mul(q32_expanded)
        .ok_or(StakingError::MathOverflow)?;

    let rate_per_second = numerator
        .checked_div(86400u128)
        .ok_or(StakingError::MathOverflow)?;

    // Ensure result fits in u64
    require!(
        rate_per_second <= u64::MAX as u128,
        StakingError::MathOverflow
    );

    Ok(rate_per_second as u64)
}
