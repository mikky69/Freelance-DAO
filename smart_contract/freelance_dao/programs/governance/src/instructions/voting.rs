use anchor_lang::prelude::*;
use crate::{accounts::*, constants::*, errors::ErrorCode, events::*, state::*};

#[derive(Accounts)]
#[instruction(choice: VoteChoice)]
pub struct CastVote<'info> {
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
    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + 32 + 32 + 1 + 8 + 1 + 1,
        seeds = [VOTE_SEED, &proposal.key().to_bytes()[..], &voter.key().to_bytes()[..]],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(mut, seeds = [TREASURY_SEED], bump)]
    pub fee_wallet: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn cast_vote(ctx: Context<CastVote>, choice: VoteChoice) -> Result<()> {
    let dao_config = &ctx.accounts.dao_config;
    let proposal = &mut ctx.accounts.proposal;
    let vote_record = &mut ctx.accounts.vote_record;
    let clock = &ctx.accounts.clock;

    require!(
        clock.unix_timestamp >= proposal.start_ts && clock.unix_timestamp < proposal.end_ts,
        ErrorCode::VotingWindowClosed
    );

    // Transfer SOL fee
    let cpi_accounts = anchor_lang::system_program::Transfer {
        from: ctx.accounts.voter.to_account_info(),
        to: ctx.accounts.fee_wallet.to_account_info(),
    };
    let cpi_program = ctx.accounts.system_program.to_account_info();
    anchor_lang::system_program::transfer(
        CpiContext::new(cpi_program, cpi_accounts),
        dao_config.vote_fee_lamports,
    )?;

    // Simplified weight: default to 1 (CPI to Staking TBD)
    let weight = 1;

    // Check for double-voting
    require!(!vote_record.paid_fee, ErrorCode::AlreadyVoted);

    // Update vote record
    vote_record.proposal = proposal.key();
    vote_record.voter = ctx.accounts.voter.key();
    vote_record.choice = choice.clone();
    vote_record.weight = weight;
    vote_record.paid_fee = true;
    vote_record.bump = ctx.bumps.vote_record;

    // Update proposal tallies
    match choice {
        VoteChoice::Yes => proposal.tally_yes += weight,
        VoteChoice::No => proposal.tally_no += weight,
    }

    emit!(VoteCast {
        id: proposal.key(),
        voter: vote_record.voter,
        choice,
        weight,
    });

    Ok(())
}