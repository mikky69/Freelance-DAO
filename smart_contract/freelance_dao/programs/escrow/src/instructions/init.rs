use anchor_lang::prelude::*;
use crate::{state::Counter, constants::COUNTER_SEED};

#[derive(Accounts)]
pub struct InitCounter<'info> {
    #[account(
        init,
        payer = payer,
        space = Counter::SIZE,
        seeds = [COUNTER_SEED],
        bump
    )]
    pub counter: Account<'info, Counter>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn init_counter(ctx: Context<InitCounter>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.count = 0;
    counter.bump = ctx.bumps.counter;
    
    msg!("Counter initialized");
    Ok(())
}