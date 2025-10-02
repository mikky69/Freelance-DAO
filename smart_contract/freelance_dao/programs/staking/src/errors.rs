use anchor_lang::prelude::*;

#[error_code]
pub enum StakingError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Pool is paused")]
    PoolPaused,
    #[msg("Amount too small")]
    AmountTooSmall,
    #[msg("Insufficient staked amount")]
    InsufficientStaked,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Invalid exchange rate")]
    InvalidExchangeRate,
    #[msg("Insufficient points")]
    InsufficientPoints,
    #[msg("Invalid pool")]
    InvalidPool,
    #[msg("Position not found")]
    PositionNotFound,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Invalid vault")]
    InvalidVault,
    #[msg("Stake limit exceeded")]
    StakeLimitExceeded,
}
