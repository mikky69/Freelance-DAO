use anchor_lang::prelude::*;
use crate::error::DisputeError;
use crate::events::PanelFormed;
use crate::state::{Dispute, DisputePanel, DisputeState};

#[derive(Accounts)]
pub struct FormPanel<'info> {
    #[account(mut)]
    pub admin: Signer<'info>, // In production, this should be a proper admin/multisig
    
    #[account(
        mut,
        constraint = dispute.state == DisputeState::Pending @ DisputeError::InvalidDisputeState
    )]
    pub dispute: Account<'info, Dispute>,
    
    #[account(
        init,
        payer = admin,
        space = DisputePanel::space(),
        seeds = [b"panel", &dispute.id.to_le_bytes()[..]],
        bump
    )]
    pub panel: Account<'info, DisputePanel>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<FormPanel>,
    members: Vec<Pubkey>,
    selection_seed: u64,
    required_quorum: u16,
) -> Result<()> {
    require!(!members.is_empty(), DisputeError::InvalidPanelSize);
    require!(members.len() <= DisputePanel::MAX_PANEL_SIZE, DisputeError::InvalidPanelSize);
    require!(required_quorum > 0, DisputeError::InvalidPanelSize);
    require!(required_quorum <= members.len() as u16, DisputeError::InvalidPanelSize);
    
    let dispute = &mut ctx.accounts.dispute;
    let panel = &mut ctx.accounts.panel;
    let clock = Clock::get()?;
    
    // Set panel expiry (e.g., 14 days from now)
    let expires_at = clock.unix_timestamp + (14 * 24 * 60 * 60); // 14 days
    
    // Initialize weights (equal voting power for now)
    let weights = vec![1u16; members.len()];
    
    panel.dispute_id = dispute.id;
    panel.members = members.clone();
    panel.weights = weights;
    panel.selection_seed = selection_seed;
    panel.expires_at = expires_at;
    panel.total_votes_cast = 0;
    panel.weighted_votes_cast = 0;
    panel.bump = ctx.bumps.panel;
    
    // Update dispute state
    dispute.state = DisputeState::PanelFormed;
    dispute.panel_size = members.len() as u16;
    dispute.required_quorum = required_quorum;
    
    emit!(PanelFormed {
        dispute_id: dispute.id,
        members,
        panel_size: dispute.panel_size,
        required_quorum,
        expires_at,
    });
    
    Ok(())
}