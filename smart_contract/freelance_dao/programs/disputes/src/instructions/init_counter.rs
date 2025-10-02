use crate::state::{AdminConfig, DisputeCounter};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitCounter<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = AdminConfig::SPACE,
        seeds = [b"admin_config"],
        bump
    )]
    pub admin_config: Account<'info, AdminConfig>,

    #[account(
        init,
        payer = admin,
        space = DisputeCounter::SPACE,
        seeds = [b"dispute_counter"],
        bump
    )]
    pub counter: Account<'info, DisputeCounter>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitCounter>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.count = 0;
    counter.bump = ctx.bumps.counter;

    let admin_config = &mut ctx.accounts.admin_config;
    admin_config.authority = ctx.accounts.admin.key();
    admin_config.bump = ctx.bumps.admin_config;

    Ok(())
}
