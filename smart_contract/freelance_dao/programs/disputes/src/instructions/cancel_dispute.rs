use anchor_lang::prelude::*;
use crate::error::DisputeError;
use crate::events::DisputeCanceled;
use crate::state::{AdminConfig, Dispute, DisputeState};

#[derive(Accounts)]
pub struct CancelDispute<'info> {
    #[account(mut)]
    pub canceler: Signer<'info>,

    #[account(
        seeds = [b"admin_config"],
        bump = admin_config.bump
    )]
    pub admin_config: Account<'info, AdminConfig>,

    #[account(
        mut,
        constraint = dispute.state == DisputeState::Pending 
            || dispute.state == DisputeState::PanelFormed 
            || dispute.state == DisputeState::Deliberating 
            @ DisputeError::CannotCancel
    )]
    pub dispute: Account<'info, Dispute>,
}

pub fn handler(ctx: Context<CancelDispute>) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute;
    let canceler = ctx.accounts.canceler.key();
    let clock = Clock::get()?;

    // Authorization: Either dispute opener or admin can cancel
    let is_opener = dispute.opened_by == canceler;
    let is_admin = ctx.accounts.admin_config.authority == canceler;
    
    require!(
        is_opener || is_admin,
        DisputeError::UnauthorizedCancel
    );

    // Additional restriction: opener can only cancel before judgment
    if is_opener && !is_admin {
        require!(
            dispute.state != DisputeState::Judged && dispute.state != DisputeState::Executed,
            DisputeError::CannotCancel
        );
    }

    let previous_state = dispute.state.clone();
    dispute.state = DisputeState::Canceled;

    emit!(DisputeCanceled {
        dispute_id: dispute.id,
        canceled_by: canceler,
        previous_state,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}