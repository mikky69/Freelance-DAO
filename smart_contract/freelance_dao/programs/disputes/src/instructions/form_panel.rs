use crate::error::DisputeError;
use crate::events::PanelFormed;
use crate::state::{AdminConfig, Dispute, DisputePanel, DisputeState};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct FormPanel<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [b"admin_config"],
        bump = admin_config.bump,
        constraint = admin_config.authority == admin.key() @ DisputeError::Unauthorized
    )]
    pub admin_config: Account<'info, AdminConfig>,

    #[account(
        mut,
        constraint = dispute.state == DisputeState::Pending @ DisputeError::InvalidDisputeState,
        constraint = dispute.panel_size == 0 @ DisputeError::PanelAlreadyFormed
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
    require!(
        members.len() <= DisputePanel::MAX_PANEL_SIZE,
        DisputeError::InvalidPanelSize
    );
    require!(required_quorum > 0, DisputeError::InvalidPanelSize);
    require!(
        required_quorum <= members.len() as u16,
        DisputeError::InvalidPanelSize
    );

    // Validate no duplicate members
    let mut unique_members = members.clone();
    unique_members.sort();
    unique_members.dedup();
    require!(
        unique_members.len() == members.len(),
        DisputeError::DuplicatePanelMembers
    );

    let dispute = &mut ctx.accounts.dispute;
    let panel = &mut ctx.accounts.panel;
    let clock = Clock::get()?;

    let expires_at = clock
        .unix_timestamp
        .checked_add(14 * 24 * 60 * 60)
        .ok_or(DisputeError::ArithmeticOverflow)?;

    let weights = vec![1u16; members.len()];

    let total_weight: u32 = weights.iter().map(|&w| w as u32).sum();
    require!(
        total_weight > 0 && total_weight <= u32::MAX,
        DisputeError::InvalidPanelWeights
    );

    panel.dispute_id = dispute.id;
    panel.members = members.clone();
    panel.weights = weights;
    panel.selection_seed = selection_seed;
    panel.expires_at = expires_at;
    panel.total_votes_cast = 0;
    panel.weighted_votes_cast = 0;
    panel.bump = ctx.bumps.panel;

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
