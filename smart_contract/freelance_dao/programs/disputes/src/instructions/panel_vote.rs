use crate::error::DisputeError;
use crate::events::PanelVoteCast;
use crate::state::{Dispute, DisputePanel, DisputeState, JudgmentChoice, PanelVoteRecord};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct PanelVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    // ADD mut TO DISPUTE SO WE CAN UPDATE STATE
    #[account(
        mut,  // <-- ADD THIS
        constraint = dispute.state == DisputeState::PanelFormed || dispute.state == DisputeState::Deliberating @ DisputeError::InvalidDisputeState
    )]
    pub dispute: Account<'info, Dispute>,

    #[account(
        mut,
        seeds = [b"panel", &dispute.id.to_le_bytes()[..]],
        bump = panel.bump,
        constraint = panel.is_member(&voter.key()) @ DisputeError::NotPanelMember
    )]
    pub panel: Account<'info, DisputePanel>,

    #[account(
        init,
        payer = voter,
        space = PanelVoteRecord::space(),
        seeds = [b"panel_vote", &dispute.id.to_le_bytes()[..], voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, PanelVoteRecord>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<PanelVote>, choice: JudgmentChoice) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute; // Now mutable
    let panel = &mut ctx.accounts.panel;
    let vote_record = &mut ctx.accounts.vote_record;
    let clock = Clock::get()?;

    // Check if panel has expired
    require!(
        clock.unix_timestamp < panel.expires_at,
        DisputeError::DisputeExpired
    );

    // ADD THIS: Transition to Deliberating on first vote
    if dispute.state == DisputeState::PanelFormed {
        dispute.state = DisputeState::Deliberating;
        msg!("Dispute {} entered deliberation phase", dispute.id);
    }

    // Get voter's weight
    let voter_weight = panel
        .get_member_weight(&ctx.accounts.voter.key())
        .ok_or(DisputeError::NotPanelMember)?;

    // Initialize vote record
    vote_record.dispute_id = dispute.id;
    vote_record.voter = ctx.accounts.voter.key();
    vote_record.choice = choice.clone();
    vote_record.weight = voter_weight;
    vote_record.voted_at = clock.unix_timestamp;
    vote_record.bump = ctx.bumps.vote_record;

    // Update panel vote counts
    panel.total_votes_cast += 1;
    panel.weighted_votes_cast += voter_weight as u32;

    emit!(PanelVoteCast {
        dispute_id: dispute.id,
        voter: ctx.accounts.voter.key(),
        choice,
        weight: voter_weight,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
