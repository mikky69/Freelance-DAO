use anchor_lang::prelude::*;
use crate::state::DisputeCounter;

#[derive(Accounts)]
pub struct InitCounter<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
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
    Ok(())
}