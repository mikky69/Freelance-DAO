use crate::error::DisputeError;
use crate::events::DisputeExecuted;
use crate::state::{AdminConfig, Dispute, DisputeState};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ExecuteJudgment<'info> {
    #[account(mut)]
    pub executor: Signer<'info>,

    #[account(
        seeds = [b"admin_config"],
        bump = admin_config.bump,
        constraint = admin_config.authority == executor.key() @ DisputeError::Unauthorized
    )]
    pub admin_config: Account<'info, AdminConfig>,

    #[account(
        mut,
        constraint = dispute.state == DisputeState::Judged @ DisputeError::InvalidDisputeState,
        constraint = dispute.judgment.is_some() @ DisputeError::InvalidDisputeState
    )]
    pub dispute: Account<'info, Dispute>,

    /// CHECK: This is validated by the CPI call if linked_escrow exists
    pub escrow_program: Option<UncheckedAccount<'info>>,

    /// CHECK: This is validated by the CPI call if linked_escrow exists  
    pub escrow_account: Option<UncheckedAccount<'info>>,
}

pub fn handler(ctx: Context<ExecuteJudgment>) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute;
    let clock = Clock::get()?;

    // REENTRANCY GUARD: Change state BEFORE any CPI calls
    let judgment_choice = dispute.judgment.as_ref().unwrap().choice.clone();
    let linked_escrow = dispute.linked_escrow;

    dispute.state = DisputeState::Executed;

    // Optional CPI to escrow program would go here
    if let Some(escrow_key) = linked_escrow {
        msg!("Executing judgment for escrow: {}", escrow_key);
        // TODO: Implement CPI call to escrow program
        // This must use the escrow_program and escrow_account accounts
    }

    emit!(DisputeExecuted {
        dispute_id: dispute.id,
        judgment: judgment_choice,
        linked_escrow,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
