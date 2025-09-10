use anchor_lang::prelude::*;
use crate::error::DisputeError;
use crate::events::DisputeJudged;
use crate::state::{Dispute, DisputePanel, DisputeState, Judgment, JudgmentChoice};

#[derive(Accounts)]
pub struct FinalizeJudgment<'info> {
    #[account(mut)]
    pub finalizer: Signer<'info>,
    
    #[account(
        mut,
        constraint = dispute.state == DisputeState::PanelFormed || dispute.state == DisputeState::Deliberating @ DisputeError::InvalidDisputeState
    )]
    pub dispute: Account<'info, Dispute>,
    
    #[account(
        seeds = [b"panel", &dispute.id.to_le_bytes()[..]],
        bump = panel.bump
    )]
    pub panel: Account<'info, DisputePanel>,
}

pub fn handler(ctx: Context<FinalizeJudgment>) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute;
    let panel = &ctx.accounts.panel;
    let clock = Clock::get()?;
    
    require!(
        panel.total_votes_cast >= dispute.required_quorum,
        DisputeError::QuorumNotReached
    );
    
    // TODO: Implement proper vote tallying by iterating through PanelVoteRecord accounts
    // For now, using a placeholder - in production you'd need to pass vote records as remaining accounts
    let winning_choice = JudgmentChoice::Client;
    
    dispute.judgment = Some(Judgment {
        choice: winning_choice.clone(),
        finalized_at: clock.unix_timestamp,
    });
    dispute.state = DisputeState::Judged;
    
    emit!(DisputeJudged {
        dispute_id: dispute.id,
        judgment: winning_choice,
        total_votes: panel.total_votes_cast,
        weighted_votes: panel.weighted_votes_cast,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}