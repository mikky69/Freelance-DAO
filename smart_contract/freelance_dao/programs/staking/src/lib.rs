use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod math;
pub mod state_accounts;
pub mod utils;

use instructions::*;

declare_id!("C5pXuWR2uPwLdVpqcUVREwcra2sA9cbC1YEPNrWtk7LU");

#[program]
pub mod staking {
    use super::*;

    // Initialization functions
    pub fn init_rewards_config(
        ctx: Context<InitRewardsConfig>,
        fl_dao_mint: Pubkey,
        exchange_rate: u64,
        admin: Pubkey,
    ) -> Result<()> {
        instructions::init::init_rewards_config(ctx, fl_dao_mint, exchange_rate, admin)
    }

    pub fn init_pool(
        ctx: Context<InitPool>,
        mint: Pubkey,
        is_lp: bool,
        points_per_token_per_second: u64,
        max_stake_per_user: u64, // ADD THIS
    ) -> Result<()> {
        instructions::init::init_pool(
            ctx,
            mint,
            is_lp,
            points_per_token_per_second,
            max_stake_per_user,
        )
    }

    // Staking functions
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        instructions::staking::stake(ctx, amount)
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        instructions::staking::unstake(ctx, amount)
    }

    pub fn sync_position(ctx: Context<SyncPosition>) -> Result<()> {
        instructions::staking::sync_position(ctx)
    }

    // Rewards functions
    pub fn exchange_points(ctx: Context<ExchangePoints>, points: u128, min_out: u64) -> Result<()> {
        instructions::rewards::exchange_points(ctx, points, min_out)
    }

    // Admin functions
    pub fn set_pool_params(
        ctx: Context<SetPoolParams>,
        rate: Option<u64>,
        paused: Option<bool>,
        max_stake_per_user: Option<u64>, // ADD THIS
    ) -> Result<()> {
        instructions::admin::set_pool_params(ctx, rate, paused, max_stake_per_user)
    }

    pub fn set_rewards_params(
        ctx: Context<SetRewardsParams>,
        rate: Option<u64>,
        paused: Option<bool>,
    ) -> Result<()> {
        instructions::admin::set_rewards_params(ctx, rate, paused)
    }

    // Utility functions
    pub fn get_staked_amount(ctx: Context<GetStakedAmount>) -> Result<u64> {
        instructions::utils::get_staked_amount(ctx)
    }

    pub fn get_position(ctx: Context<GetPosition>) -> Result<(u64, u128)> {
        instructions::query::get_position(ctx)
    }

    pub fn view_position(ctx: Context<ViewPosition>) -> Result<u64> {
        instructions::query::view_position(ctx)
    }
}
