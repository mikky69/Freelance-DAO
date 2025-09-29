use anchor_lang::prelude::*;

// Cross-program IDs - these MUST match your Anchor.toml
pub const STAKING_PROGRAM_ID: Pubkey =
    anchor_lang::pubkey!("DFv6N5EiAueb7xcntYB3ZL49dFbAmgimXsfgwobZpfv9");
pub const GOVERNANCE_PROGRAM_ID: Pubkey =
    anchor_lang::pubkey!("GgkLgFNYnDsCo4w9NKZrjMnhjaJ5F3XjNTMfvGjaxgFf");

// Maximum staking bonus to prevent overflow attacks (1 million vote weight)
pub const MAX_STAKING_BONUS: u64 = 1_000_000;

// Discriminator for staking position account validation
// Using placeholder [0,0,0,0,0,0,0,0] - voting.rs has logic to skip validation when placeholder is detected
// TODO: Before mainnet, run: anchor account-discriminator staking_program::StakingPosition
// and replace this with the real discriminator
pub const STAKING_POSITION_DISCRIMINATOR: [u8; 8] = [0, 0, 0, 0, 0, 0, 0, 0];

// Vote weight calculation parameters
pub const BASE_VOTE_WEIGHT: u64 = 1;
pub const PREMIUM_BONUS_WEIGHT: u64 = 1;
pub const STAKING_WEIGHT_DIVISOR: u64 = 1_000_000; // 1 FLDAO = 1 additional vote weight
