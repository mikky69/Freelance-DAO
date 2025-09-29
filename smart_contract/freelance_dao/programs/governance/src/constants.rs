use anchor_lang::prelude::*;

// Cross-program IDs
pub const STAKING_PROGRAM_ID: Pubkey =
    anchor_lang::pubkey!("DFv6N5EiAueb7xcntYB3ZL49dFbAmgimXsfgwobZpfv9");
pub const GOVERNANCE_PROGRAM_ID: Pubkey =
    anchor_lang::pubkey!("GgkLgFNYnDsCo4w9NKZrjMnhjaJ5F3XjNTMfvGjaxgFf");

pub const MAX_STAKING_BONUS: u64 = 1_000_000;
pub const STAKING_POSITION_DISCRIMINATOR: [u8; 8] = [0, 0, 0, 0, 0, 0, 0, 0]; // TODO: Replace with real discriminator
pub const BASE_VOTE_WEIGHT: u64 = 1;
pub const PREMIUM_BONUS_WEIGHT: u64 = 1;
pub const STAKING_WEIGHT_DIVISOR: u64 = 1_000_000;

// ADD THESE:
pub const ABSOLUTE_MIN_VOTE_DURATION: i64 = 3600; // 1 hour minimum
pub const MAX_QUORUM_THRESHOLD: u64 = 1_000_000_000; // Prevent impossibly high quorum
