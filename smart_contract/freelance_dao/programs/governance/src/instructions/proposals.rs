// UPDATED proposals.rs
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::{
    state_accounts::{DaoConfig, Proposal, Member},
    errors::ErrorCode,
    events::ProposalCreated,
    state::{ProposalKind, ProposalState}
};

#[derive(Accounts)]
#[instruction(kind: ProposalKind, uri: String, title_hash: [u8; 32], window: i64)]
pub struct CreateProposal<'info> {
    #[account(
        mut,
        seeds = [b"dao_config"],
        bump = dao_config.bump
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(
        init,
        payer = creator,
        space = Proposal::space(uri.len()),
        seeds = [b"proposal", dao_config.key().as_ref(), &dao_config.proposal_count.to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        mut,
        address = dao_config.usdc_treasury @ ErrorCode::InvalidTreasury
    )]
    pub usdc_treasury: Account<'info, TokenAccount>,
    #[account(mut)]
    pub creator_usdc: Account<'info, TokenAccount>,
    // Optional member account for fee discounts
    #[account(
        seeds = [b"member", dao_config.key().as_ref(), creator.key().as_ref()],
        bump = member.bump
    )]
    pub member: Option<Account<'info, Member>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    kind: ProposalKind,
    uri: String,
    title_hash: [u8; 32],
    window: i64,
) -> Result<()> {
    if ctx.accounts.dao_config.paused {
        return Err(ErrorCode::Paused.into());
    }

    if uri.len() > 200 {
        return Err(ErrorCode::UriTooLong.into());
    }
    
    if title_hash == [0u8; 32] {
        return Err(ErrorCode::InvalidTitleHash.into());
    }

    let dao_config = &ctx.accounts.dao_config;
    if window < dao_config.min_vote_duration || window > dao_config.max_vote_duration {
        return Err(ErrorCode::InvalidWindow.into());
    }

    let mut fee_amount = match kind {
        ProposalKind::Light => dao_config.light_fee_usdc,
        ProposalKind::Major => dao_config.major_fee_usdc,
    };
    
    // Apply premium member discount (50% off)
    if let Some(member) = &ctx.accounts.member {
        if member.premium {
            fee_amount = fee_amount / 2;
        }
    }

    if fee_amount > 0 {
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.creator_usdc.to_account_info(),
                    to: ctx.accounts.usdc_treasury.to_account_info(),
                    authority: ctx.accounts.creator.to_account_info(),
                },
            ),
            fee_amount,
        )?;
    }

    let proposal = &mut ctx.accounts.proposal;
    let now = ctx.accounts.clock.unix_timestamp;

    proposal.creator = ctx.accounts.creator.key();
    proposal.id = dao_config.proposal_count;
    proposal.kind = kind;
    proposal.title_hash = title_hash;
    proposal.uri = uri;
    proposal.state = ProposalState::Active;
    proposal.start_ts = now;
    proposal.end_ts = now + window;
    proposal.tally_yes = 0;
    proposal.tally_no = 0;
    proposal.total_votes = 0;
    proposal.executed = false;
    proposal.executed_at = 0;
    proposal.bump = ctx.bumps.proposal;

    ctx.accounts.dao_config.proposal_count = ctx.accounts.dao_config.proposal_count
        .checked_add(1)
        .ok_or(ErrorCode::ArithmeticOverflow)?;

    emit!(ProposalCreated {
        id: proposal.key(),
        creator: proposal.creator,
        kind: proposal.kind,
        title_hash: proposal.title_hash,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct CancelProposal<'info> {
    #[account(
        mut,
        has_one = creator @ ErrorCode::Unauthorized,
        constraint = proposal.state == ProposalState::Active @ ErrorCode::ProposalNotActive
    )]
    pub proposal: Account<'info, Proposal>,
    pub creator: Signer<'info>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let now = ctx.accounts.clock.unix_timestamp;
    
    // Can only cancel if voting hasn't started or very early in voting period
    let grace_period = 3600; // 1 hour grace period
    if now > proposal.start_ts + grace_period {
        return Err(ErrorCode::VotingWindowClosed.into());
    }
    
    proposal.state = ProposalState::Canceled;
    
    Ok(())
}

#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    #[account(
        seeds = [b"dao_config"],
        bump = dao_config.bump
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let dao_config = &ctx.accounts.dao_config;
    let now = ctx.accounts.clock.unix_timestamp;

    if proposal.state != ProposalState::Active {
        return Err(ErrorCode::ProposalNotActive.into());
    }

    if now < proposal.end_ts {
        return Err(ErrorCode::VotingStillActive.into());
    }

    // Check quorum
    if proposal.total_votes < dao_config.quorum_threshold {
        proposal.state = ProposalState::Failed;
        emit!(crate::events::ProposalFinalized {
            id: proposal.key(),
            result: proposal.state,
            total_votes: proposal.total_votes,
            yes_votes: proposal.tally_yes,
            no_votes: proposal.tally_no,
        });
        return Ok(());
    }

    // Check approval threshold
    let approval_percentage = (proposal.tally_yes * 10000) / proposal.total_votes;
    if approval_percentage >= dao_config.approval_threshold {
        proposal.state = ProposalState::Succeeded;
    } else {
        proposal.state = ProposalState::Failed;
    }

    emit!(crate::events::ProposalFinalized {
        id: proposal.key(),
        result: proposal.state,
        total_votes: proposal.total_votes,
        yes_votes: proposal.tally_yes,
        no_votes: proposal.tally_no,
    });

    Ok(())
}