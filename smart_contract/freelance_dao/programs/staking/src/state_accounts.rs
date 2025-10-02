use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct RewardsConfig {
    pub admin: Pubkey,              // 32
    pub fl_dao_mint: Pubkey,        // 32
    pub exchange_rate: u64,         // 8   (points per $FLDAO)
    pub treasury: Pubkey,           // 32  (treasury PDA)
    pub mint_authority: Pubkey,     // 32  (PDA for minting)
    pub global_points_issued: u128, // 16  (tracking)
    pub global_fldao_minted: u64,   // 8   (tracking)
    pub paused: bool,               // 1
    pub bump: u8,                   // 1
}

impl RewardsConfig {
    pub const SPACE: usize = 8 + 32 * 4 + 8 + 16 + 8 + 1 + 1; // 170 bytes
}

#[account]
#[derive(Default)]
pub struct StakePool {
    pub mint: Pubkey,                     // 32
    pub vault: Pubkey,                    // 32
    pub is_lp: bool,                      // 1
    pub points_per_token_per_second: u64, // 8
    pub total_staked: u64,                // 8
    pub total_points_issued: u128,        // 16
    pub created_at: i64,                  // 8
    pub paused: bool,                     // 1
    pub bump: u8,                         // 1
    pub max_stake_per_user: u64,          // 8  <- ADD THIS
}

impl StakePool {
    pub const SPACE: usize = 8 + 32 * 2 + 1 + 8 * 4 + 16 + 1 + 1; // 123 bytes (was 115)
}

#[account]
#[derive(Default)]
pub struct StakePosition {
    pub staker: Pubkey,      // 32
    pub pool: Pubkey,        // 32  (StakePool PDA)
    pub amount: u64,         // 8   (tokens staked)
    pub accum_points: u128,  // 16  (accrued staking points)
    pub last_update_ts: i64, // 8   (for point calculation)
    pub created_at: i64,     // 8
    pub bump: u8,            // 1
}

impl StakePosition {
    pub const SPACE: usize = 8 + 32 * 2 + 8 + 16 + 8 + 8 + 1; // 113 bytes
}
