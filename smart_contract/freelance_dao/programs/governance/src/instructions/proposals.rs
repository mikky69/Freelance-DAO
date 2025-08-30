use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::{
    state_accounts::{DaoConfig, Proposal},
    errors::ErrorCode,
    events::ProposalCreated,
    state::{ProposalKind, ProposalState}
};

#[derive(Accounts)]
#[instruction(kind: ProposalKind, uri: String, title_hash: [u8; 32], window: i64)]
#[allow(unexpected_cfgs)]
pub struct CreateProposal<'info> {
    #[account(mut)]
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
    #[account(mut)]
    pub usdc_treasury: Account<'info, TokenAccount>,
    #[account(mut)]
    pub creator_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
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

    // Validate URI length (example: max 200 characters)
    if uri.len() > 200 {
        return Err(ErrorCode::UriTooLong.into());
    }

    // Validate voting window
    let dao_config = &ctx.accounts.dao_config;
    if window < dao_config.min_vote_duration || window > dao_config.max_vote_duration {
        return Err(ErrorCode::InvalidWindow.into());
    }

    // Determine fee based on proposal kind
    let fee_amount = match kind {
        ProposalKind::Light => dao_config.light_fee_usdc,
        ProposalKind::Major => dao_config.major_fee_usdc,
    };

    // Transfer USDC fee to treasury
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
    proposal.bump = [ctx.bumps.proposal];

    // Increment proposal count
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
#[allow(unexpected_cfgs)]
pub struct FinalizeProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let now = ctx.accounts.clock.unix_timestamp;

    // Check if proposal is active
    if proposal.state != ProposalState::Active {
        return Err(ErrorCode::ProposalNotActive.into());
    }

    // Check if voting period has ended
    if now < proposal.end_ts {
        return Err(ErrorCode::VotingStillActive.into());
    }

    // Determine result based on vote tally
    proposal.state = if proposal.tally_yes > proposal.tally_no {
        ProposalState::Succeeded
    } else {
        ProposalState::Failed
    };

    emit!(crate::events::ProposalFinalized {
        id: proposal.key(),
        result: proposal.state,
    });

    Ok(())
}