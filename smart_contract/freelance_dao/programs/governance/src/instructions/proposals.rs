use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use crate::{state_accounts::{DaoConfig, Proposal}, errors::ErrorCode, events::{ProposalCreated, ProposalFinalized}, state::{ProposalKind, ProposalState}};

#[derive(Accounts)]
#[allow(unexpected_cfgs)] // Suppress cfg warnings
#[instruction(uri: String)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(
        init,
        payer = creator,
        space = Proposal::space(uri.len()),
        seeds = [b"proposal", dao_config.proposal_count.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = creator
    )]
    pub creator_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub usdc_treasury: Account<'info, TokenAccount>,
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
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
    if window < ctx.accounts.dao_config.min_vote_duration || window > ctx.accounts.dao_config.max_vote_duration {
        return Err(ErrorCode::InvalidWindow.into());
    }

    let fee_usdc = match kind {
        ProposalKind::Light => ctx.accounts.dao_config.light_fee_usdc,
        ProposalKind::Major => ctx.accounts.dao_config.major_fee_usdc,
    };

    // Transfer USDC fee
    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator_ata.to_account_info(),
                to: ctx.accounts.usdc_treasury.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        ),
        fee_usdc,
    )?;

    let now = Clock::get()?.unix_timestamp;

    let proposal = &mut ctx.accounts.proposal;
    proposal.creator = ctx.accounts.creator.key();
    proposal.id = ctx.accounts.dao_config.proposal_count;
    proposal.kind = kind;
    proposal.title_hash = title_hash;
    proposal.uri = uri;
    proposal.state = ProposalState::Active;
    proposal.start_ts = now;
    proposal.end_ts = now + window;
    proposal.tally_yes = 0;
    proposal.tally_no = 0;
    proposal.bump = [ctx.bumps.proposal];

    // Check for overflow before incrementing
    ctx.accounts.dao_config.proposal_count = ctx.accounts.dao_config.proposal_count
        .checked_add(1)
        .ok_or(ErrorCode::ArithmeticOverflow)?;

    emit!(ProposalCreated {
        id: proposal.key(),
        creator: proposal.creator,
        kind: proposal.kind,
    });

    Ok(())
}

#[derive(Accounts)]
#[allow(unexpected_cfgs)] // Suppress cfg warnings
pub struct FinalizeProposal<'info> {
    pub dao_config: Account<'info, DaoConfig>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
    if ctx.accounts.dao_config.paused {
        return Err(ErrorCode::Paused.into());
    }

    let proposal = &mut ctx.accounts.proposal;
    if proposal.state != ProposalState::Active {
        return Err(ErrorCode::ProposalNotActive.into());
    }

    let now = ctx.accounts.clock.unix_timestamp;
    // FIX: Correct logic - if voting period hasn't ended yet, return error
    if now < proposal.end_ts {
        return Err(ErrorCode::VotingStillActive.into());
    }

    proposal.state = if proposal.tally_yes > proposal.tally_no {
        ProposalState::Succeeded
    } else {
        ProposalState::Failed
    };

    emit!(ProposalFinalized {
        id: proposal.key(),
        result: proposal.state,
    });

    Ok(())
}