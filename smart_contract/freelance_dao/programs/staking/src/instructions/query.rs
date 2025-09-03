use anchor_lang::prelude::*;
use crate::state_accounts::StakePosition;

#[derive(Accounts)]
pub struct GetPosition<'info> {
    #[account(
        seeds = [b"position", pool.key().as_ref(), staker.key().as_ref()],
        bump = position.bump
    )]
    pub position: Account<'info, StakePosition>,
    /// CHECK: Pool validation happens in position seeds
    pub pool: UncheckedAccount<'info>,
    pub staker: Signer<'info>,
}

pub fn get_position(ctx: Context<GetPosition>) -> Result<(u64, u128)> {
    let position = &ctx.accounts.position;
    Ok((position.amount, position.accum_points))
}

// View-only function for cross-program calls
#[derive(Accounts)]
pub struct ViewPosition<'info> {
    #[account(
        seeds = [b"position", pool.key().as_ref(), user.key().as_ref()],
        bump = position.bump
    )]
    pub position: Account<'info, StakePosition>,
    /// CHECK: Pool validation happens in position seeds
    pub pool: UncheckedAccount<'info>,
    /// CHECK: User key used in seeds
    pub user: UncheckedAccount<'info>,
}

pub fn view_position(ctx: Context<ViewPosition>) -> Result<u64> {
    Ok(ctx.accounts.position.amount)
}