use anchor_lang::{prelude::*, system_program};
use crate::{state_accounts::{DaoConfig, Proposal, VoteRecord}, errors::ErrorCode, events::VoteCast, state::VoteChoice};

#[derive(Accounts)]
#[allow(unexpected_cfgs)] // Suppress cfg warnings
pub struct CastVote<'info> {
    pub dao_config: Account<'info, DaoConfig>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init_if_needed,
        payer = voter,
        space = VoteRecord::SPACE,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    // Placeholder for Staking program CPI
    // #[account(mut)]
    // pub staking_program: Program<'info, StakingProgram>,
    // #[account(mut)]
    // pub stake_position: Account<'info, StakePosition>,
}

pub fn cast_vote(ctx: Context<CastVote>, choice: VoteChoice) -> Result<()> {
    if ctx.accounts.dao_config.paused {
        return Err(ErrorCode::Paused.into());
    }

    let proposal = &mut ctx.accounts.proposal;
    let now = ctx.accounts.clock.unix_timestamp;
    if now < proposal.start_ts || now >= proposal.end_ts || proposal.state != crate::state::ProposalState::Active {
        return Err(ErrorCode::VotingWindowClosed.into());
    }

    let vote_record = &mut ctx.accounts.vote_record;
    if vote_record.voter != Pubkey::default() {
        return Err(ErrorCode::AlreadyVoted.into());
    }

    // Transfer SOL vote fee
    let fee_lamports = ctx.accounts.dao_config.vote_fee_lamports;
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.voter.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        ),
        fee_lamports,
    )?;

    // Vote weight: Default to 1; later add staking CPI
    let weight: u64 = 1;
    // TODO: CPI to Staking program to get staked $FLDAO
    // Example: weight = 1 + floor(stake_position.amount / dao_config.weight_params)
    // let stake_position = &ctx.accounts.stake_position;
    // let weight = 1 + (stake_position.amount / ctx.accounts.dao_config.weight_params);

    vote_record.proposal = proposal.key();
    vote_record.voter = ctx.accounts.voter.key();
    vote_record.choice = choice;
    vote_record.weight = weight;
    vote_record.paid_fee = true;
    vote_record.bump = [ctx.bumps.vote_record];

    // FIX: Add overflow protection for vote tallies
    match choice {
        VoteChoice::Yes => {
            proposal.tally_yes = proposal.tally_yes
                .checked_add(weight)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
        },
        VoteChoice::No => {
            proposal.tally_no = proposal.tally_no
                .checked_add(weight)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
        },
    }

    emit!(VoteCast {
        id: proposal.key(),
        voter: vote_record.voter,
        choice: vote_record.choice,
        weight: vote_record.weight,
    });

    Ok(())
}