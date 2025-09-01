// programs/staking/src/errors.rs
use anchor_lang::prelude::*;

#[error_code]
pub enum StakingError {
    #[msg("Math operation resulted in overflow")]
    MathOverflow,
    #[msg("Insufficient staked amount")]
    InsufficientStaked,
    #[msg("Insufficient points to exchange")]
    InsufficientPoints,
    #[msg("Amount too small to stake")]
    AmountTooSmall,
    #[msg("Invalid exchange rate")]
    InvalidExchangeRate,
    #[msg("Pool is paused")]
    PoolPaused,
    #[msg("Rewards system is paused")]
    RewardsPaused,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid pool mint")]
    InvalidPoolMint,
    #[msg("Invalid mint authority")]
    InvalidMintAuthority,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
}

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

#[event]
pub struct PoolCreated {
    pub pool: Pubkey,
    pub mint: Pubkey,
    pub is_lp: bool,
    pub rate: u64,
    pub timestamp: i64,
}

