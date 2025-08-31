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
