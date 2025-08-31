
// programs/staking/src/lib.rs
use anchor_lang::prelude::*;

pub mod state_accounts;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;
pub mod math;
pub mod constants;
pub mod utils;

use instructions::*;

declare_id!("G32wz6KmFi9qeJMGUY9GTmssix9TvmpxnseiHHpLenAC");

#[program]
pub mod staking {
    use super::*;

    // Initialize rewards system
    pub fn init_rewards_config(
        ctx: Context<InitRewardsConfig>,
        fl_dao_mint: Pubkey,
        exchange_rate: u64,
        admin: Pubkey,
    ) -> Result<()> {
        instructions::init::init_rewards_config(ctx, fl_dao_mint, exchange_rate, admin)
    }

    // Pool management
    pub fn init_pool(
        ctx: Context<InitPool>,
        mint: Pubkey,
        is_lp: bool,
        points_per_token_per_second: u64,
    ) -> Result<()> {
        instructions::init::init_pool(ctx, mint, is_lp, points_per_token_per_second)
    }

    // Staking operations
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        instructions::staking::stake(ctx, amount)
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        instructions::staking::unstake(ctx, amount)
    }

    pub fn sync_position(ctx: Context<SyncPosition>) -> Result<()> {
        instructions::staking::sync_position(ctx)
    }

    // Rewards
    pub fn exchange_points(ctx: Context<ExchangePoints>, points: u128, min_out: u64) -> Result<()> {
        instructions::rewards::exchange_points(ctx, points, min_out)
    }

    // Admin functions
    pub fn set_pool_params(
        ctx: Context<SetPoolParams>,
        points_per_token_per_second: Option<u64>,
        paused: Option<bool>,
    ) -> Result<()> {
        instructions::admin::set_pool_params(ctx, points_per_token_per_second, paused)
    }

    pub fn set_rewards_params(
        ctx: Context<SetRewardsParams>,
        exchange_rate: Option<u64>,
        paused: Option<bool>,
    ) -> Result<()> {
        instructions::admin::set_rewards_params(ctx, exchange_rate, paused)
    }

    // View functions for governance integration
    pub fn get_staked_amount(ctx: Context<GetStakedAmount>) -> Result<u64> {
        instructions::utils::get_staked_amount(ctx)
    }
}

