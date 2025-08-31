// programs/staking/src/state.rs
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum PoolType {
    Single,  // Single token (USDC)
    LP,      // LP token pair
}

impl Default for PoolType {
    fn default() -> Self {
        PoolType::Single
    }
}
