// programs/staking/src/constants.rs
pub const SECONDS_PER_DAY: i64 = 86400;
pub const MIN_STAKE_AMOUNT: u64 = 1_000_000; // 1 USDC (6 decimals)
pub const MIN_UNSTAKE_AMOUNT: u64 = 1_000_000; // 1 USDC

// Default rates (points per token per day, converted to Q32.32 per second)
pub const DEFAULT_USDC_DAILY_RATE: u64 = 1_000_000; // 1 point per USDC per day
pub const DEFAULT_LP_DAILY_RATE: u64 = 1_500_000;   // 1.5x multiplier for LP
