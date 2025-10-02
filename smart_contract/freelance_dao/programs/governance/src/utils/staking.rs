use crate::constants::STAKING_PROGRAM_ID;
use anchor_lang::prelude::*;

pub fn get_staking_pool_pda(mint: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"pool", mint.as_ref()], &STAKING_PROGRAM_ID)
}

pub fn get_stake_position_pda(pool: &Pubkey, staker: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"position", pool.as_ref(), staker.as_ref()],
        &STAKING_PROGRAM_ID,
    )
}

pub fn calculate_vote_weight(
    base_weight: u64,
    premium_bonus: u64,
    staked_amount: u64,
    weight_divisor: u64,
) -> Result<u64> {
    let staking_bonus = staked_amount.checked_div(weight_divisor).unwrap_or(0);

    base_weight
        .checked_add(premium_bonus)
        .and_then(|w| w.checked_add(staking_bonus))
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow.into())
}
