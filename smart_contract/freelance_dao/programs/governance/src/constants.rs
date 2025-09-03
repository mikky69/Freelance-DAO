use anchor_lang::prelude::*;

// Cross-program IDs - these MUST match your Anchor.toml
pub const STAKING_PROGRAM_ID: Pubkey = anchor_lang::pubkey!("DFv6N5EiAueb7xcntYB3ZL49dFbAmgimXsfgwobZpfv9");
pub const GOVERNANCE_PROGRAM_ID: Pubkey = anchor_lang::pubkey!("GgkLgFNYnDsCo4w9NKZrjMnhjaJ5F3XjNTMfvGjaxgFf");

// Vote weight calculation parameters
pub const BASE_VOTE_WEIGHT: u64 = 1;
pub const PREMIUM_BONUS_WEIGHT: u64 = 1;
pub const STAKING_WEIGHT_DIVISOR: u64 = 1_000_000; // 1 FLDAO = 1 additional vote weight

