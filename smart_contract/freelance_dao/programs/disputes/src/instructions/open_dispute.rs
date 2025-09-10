use anchor_lang::prelude::*;
use crate::error::DisputeError;
use crate::events::DisputeOpened;
use crate::state::{Dispute, DisputeState, DisputeCounter};

#[derive(Accounts)]
#[instruction(parties: Vec<Pubkey>, uri: String)]
pub struct OpenDispute<'info> {
    #[account(mut)]
    pub opener: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"dispute_counter"],
        bump = counter.bump
    )]
    pub counter: Account<'info, DisputeCounter>,
    
    #[account(
        init,
        payer = opener,
        space = Dispute::space(),
        seeds = [b"dispute", &(counter.count + 1).to_le_bytes()[..]],
        bump
    )]
    pub dispute: Account<'info, Dispute>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<OpenDispute>,
    parties: Vec<Pubkey>,
    uri: String,
    linked_escrow: Option<Pubkey>,
) -> Result<()> {
    require!(parties.len() >= 2, DisputeError::InvalidParties);
    require!(parties.len() <= Dispute::MAX_PARTIES, DisputeError::InvalidParties);
    require!(uri.len() <= Dispute::MAX_URI_LENGTH, DisputeError::UriTooLong);
    
    let counter = &mut ctx.accounts.counter;
    let dispute = &mut ctx.accounts.dispute;
    let clock = Clock::get()?;
    
    // Increment counter
    counter.count += 1;
    let dispute_id = counter.count;
    
    dispute.id = dispute_id;
    dispute.opened_by = ctx.accounts.opener.key();
    dispute.parties = parties.clone();
    dispute.uri = uri.clone();
    dispute.state = DisputeState::Pending;
    dispute.created_at = clock.unix_timestamp;
    dispute.panel_size = 0;
    dispute.required_quorum = 0;
    dispute.judgment = None;
    dispute.linked_escrow = linked_escrow;
    dispute.bump = ctx.bumps.dispute;
    
    emit!(DisputeOpened {
        id: dispute_id,
        opened_by: ctx.accounts.opener.key(),
        parties,
        uri,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
