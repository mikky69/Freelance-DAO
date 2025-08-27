use anchor_lang::prelude::*;
use crate::{accounts::*, constants::*, errors::ErrorCode, events::*, state::*};

#[derive(Accounts)]
#[instruction(kind: ProposalKind, uri: String, title_hash: [u8; 32], window: i64)]
pub struct CreateProposal<'info> {
    #[account(
        seeds = [DAO_CONFIG_SEED],
        bump = dao_config.bump,
        constraint = !dao_config.paused @ ErrorCode::Paused
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 1 + 32 + 4 + uri.len() + 1 + 8 + 8 + 8 + 8 + 1,
        seeds = [PROPOSAL_SEED, &dao_config.key().to_bytes()[..]],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        mut,
        associated_token::mint = dao_config.usdc_mint,
        associated_token::authority = creator
    )]
    pub creator_ata: Account<'info, anchor_spl::token::TokenAccount>,
    #[account(
        mut,
        associated_token::mint = dao_config.usdc_mint,
        associated_token::authority = dao_config
    )]
    pub fee_wallet: Account<'info, anchor_spl::token::TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    #[account(
        seeds = [DAO_CONFIG_SEED],
        bump = dao_config.bump,
        constraint = !dao_config.paused @ ErrorCode::Paused
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(
        mut,
        seeds = [PROPOSAL_SEED, &dao_config.key().to_bytes()[..]],
        bump = proposal.bump,
        constraint = proposal.state == ProposalState::Active @ ErrorCode::VotingWindowClosed
    )]
    pub proposal: Account<'info, Proposal>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    kind: ProposalKind,
    uri: String,
    title_hash: [u8; 32],
    window: i64,
) -> Result<()> {
    require!(uri.len() <= MAX_URI_LENGTH, ErrorCode::UriTooLong);

    let dao_config = &ctx.accounts.dao_config;
    let proposal = &mut ctx.accounts.proposal;
    let creator_ata = &ctx.accounts.creator_ata;
    let fee_wallet = &ctx.accounts.fee_wallet;
    let clock = &ctx.accounts.clock;

    // Check eligibility (simplified: assume USDC balance check for now)
    let fee = match kind {
        ProposalKind::Light => dao_config.light_fee_usdc,
        ProposalKind::Major => dao_config.major_fee_usdc,
    };
    require!(creator_ata.amount >= fee, ErrorCode::InsufficientFees);

    // Validate window
    require!(
        window >= dao_config.min_vote_duration && window <= dao_config.max_vote_duration,
        ErrorCode::InvalidWindow
    );

    // Transfer USDC fee
    let cpi_accounts = anchor_spl::token::Transfer {
        from: creator_ata.to_account_info(),
        to: fee_wallet.to_account_info(),
        authority: ctx.accounts.creator.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    anchor_spl::token::transfer(CpiContext::new(cpi_program, cpi_accounts), fee)?;

    // Initialize proposal
    proposal.creator = ctx.accounts.creator.key();
    proposal.kind = kind;
    proposal.title_hash = title_hash;
    proposal.uri = uri;
    proposal.state = ProposalState::Active;
    proposal.start_ts = clock.unix_timestamp;
    proposal.end_ts = clock.unix_timestamp + window;
    proposal.tally_yes = 0;
    proposal.tally_no = 0;
    proposal.bump = ctx.bumps.proposal;

    emit!(ProposalCreated {
        id: proposal.key(),
        creator: proposal.creator,
        kind: proposal.kind.clone(),
    });

    Ok(())
}

pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let clock = &ctx.accounts.clock;

    require!(
        clock.unix_timestamp >= proposal.end_ts,
        ErrorCode::VotingWindowClosed
    );

    proposal.state = if proposal.tally_yes > proposal.tally_no {
        ProposalState::Succeeded
    } else {
        ProposalState::Failed
    };

    emit!(ProposalFinalized {
        id: proposal.key(),
        result: proposal.state.clone(),
    });

    Ok(())
}