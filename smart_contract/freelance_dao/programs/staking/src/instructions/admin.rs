// programs/staking/src/instructions/admin.rs
use anchor_lang::prelude::*;

pub fn set_pool_params(_ctx: Context<()>, _rate: Option<u64>, _paused: Option<bool>) -> Result<()> {
    // TODO: Implement admin functions
    Ok(())
}

pub fn set_rewards_params(_ctx: Context<()>, _rate: Option<u64>, _paused: Option<bool>) -> Result<()> {
    // TODO: Implement admin functions  
    Ok(())
}

