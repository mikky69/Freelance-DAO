use anchor_lang::prelude::*;
use crate::error::DisputeError;
use crate::events::DisputeExecuted;
use crate::state::{Dispute, DisputeState};

#[derive(Accounts)]
pub struct ExecuteJudgment<'info> {
    #[account(mut)]
    pub executor: Signer<'info>,
    
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
    
    // Clone the judgment choice before mutating dispute
    let judgment_choice = dispute.judgment.as_ref().unwrap().choice.clone();
    let linked_escrow = dispute.linked_escrow;
    
    // Optional CPI to escrow program would go here
    if let Some(escrow_key) = linked_escrow {
        msg!("Executing judgment for escrow: {}", escrow_key);
        // CPI call to escrow program would be implemented here
    }
    
    dispute.state = DisputeState::Executed;
    
    emit!(DisputeExecuted {
        dispute_id: dispute.id,
        judgment: judgment_choice,
        linked_escrow,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}