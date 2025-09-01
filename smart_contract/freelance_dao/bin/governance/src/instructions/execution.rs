use anchor_lang::prelude::*;
use crate::{
    state_accounts::{DaoConfig, Proposal},
    errors::ErrorCode,
    events::ProposalExecuted,
    state::ProposalState
};

// Define the execution delay constant (24 hours in seconds)
const EXECUTION_DELAY: i64 = 86400;

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(
        mut,
        seeds = [b"dao_config"],
        bump = dao_config.bump
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(
        mut,
        constraint = proposal.state == ProposalState::Succeeded @ ErrorCode::ProposalNotSucceeded,
        constraint = !proposal.executed @ ErrorCode::AlreadyExecuted
    )]
    pub proposal: Account<'info, Proposal>,
    pub executor: Signer<'info>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let now = ctx.accounts.clock.unix_timestamp;
    
    // Ensure proposal has been finalized and succeeded
    if proposal.state != ProposalState::Succeeded {
        return Err(ErrorCode::ProposalNotSucceeded.into());
    }
    
    if proposal.executed {
        return Err(ErrorCode::AlreadyExecuted.into());
    }
    
    // Check execution delay
    if now < proposal.end_ts + EXECUTION_DELAY {
        return Err(ErrorCode::ExecutionDelayNotMet.into());
    }
    
    proposal.executed = true;
    proposal.executed_at = now;
    
    // TODO: Add actual execution logic based on proposal type
    // For now, just mark as executed - specific execution logic
    // can be added in separate instructions for different proposal types
    
    emit!(ProposalExecuted {
        id: proposal.key(),
        executor: ctx.accounts.executor.key(),
        executed_at: now,
    });
    
    Ok(())
}

// Specific execution instructions for different proposal types
#[derive(Accounts)]
pub struct ExecuteParamChange<'info> {
    #[account(
        mut,
        seeds = [b"dao_config"],
        bump = dao_config.bump
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(
        mut,
        constraint = proposal.state == ProposalState::Succeeded @ ErrorCode::ProposalNotSucceeded,
        constraint = proposal.executed @ ErrorCode::NotExecuted
    )]
    pub proposal: Account<'info, Proposal>,
    pub executor: Signer<'info>,
}

pub fn execute_param_change(
    ctx: Context<ExecuteParamChange>,
    new_light_fee: Option<u64>,
    new_major_fee: Option<u64>,
    new_vote_fee: Option<u64>,
) -> Result<()> {
    let dao_config = &mut ctx.accounts.dao_config;
    
    // Only execute if proposal is marked as executed
    if !ctx.accounts.proposal.executed {
        return Err(ErrorCode::NotExecuted.into());
    }
    
    if let Some(fee) = new_light_fee {
        dao_config.light_fee_usdc = fee;
    }
    if let Some(fee) = new_major_fee {
        dao_config.major_fee_usdc = fee;
    }
    if let Some(fee) = new_vote_fee {
        dao_config.vote_fee_lamports = fee;
    }
    
    Ok(())
}