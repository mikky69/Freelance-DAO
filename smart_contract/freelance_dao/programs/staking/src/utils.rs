use anchor_lang::prelude::*;
use crate::{
    state_accounts::{StakePool, StakePosition},
    errors::StakingError,
    math::calculate_points_accrued,
};

pub fn update_position_points(
    position: &mut StakePosition,
    pool: &StakePool,
    current_timestamp: i64,
) -> Result<u128> {
    if position.amount == 0 {
        position.last_update_ts = current_timestamp;
        return Ok(0);
    }

    let duration = current_timestamp - position.last_update_ts;
    if duration <= 0 {
        return Ok(0);
    }

    let points_earned = calculate_points_accrued(
        position.amount,
        pool.points_per_token_per_second,
        duration,
    )?;

    position.accum_points = position.accum_points
        .checked_add(points_earned)
        .ok_or(StakingError::MathOverflow)?;

    position.last_update_ts = current_timestamp;

    Ok(points_earned)
}