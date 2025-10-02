use anchor_lang::prelude::*;
use crate::state_accounts::StakePosition;
use crate::errors::StakingError;

#[derive(Accounts)]
pub struct GetStakedAmount<'info> {
    #[account(
        has_one = staker @ StakingError::Unauthorized
    )]
    pub position: Account<'info, StakePosition>,
    pub staker: Signer<'info>,
}

pub fn get_staked_amount(ctx: Context<GetStakedAmount>) -> Result<u64> {
    Ok(ctx.accounts.position.amount)
}