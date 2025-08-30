// UPDATED voting.rs
// ============================================
use anchor_lang::{prelude::*, system_program};
use crate::{
    state_accounts::{DaoConfig, Proposal, VoteRecord, Member},
    errors::ErrorCode,
    events::VoteCast,
    state::{VoteChoice, ProposalState}
};

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(
        seeds = [b"dao_config"],
        bump = dao_config.bump
    )]
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
    #[account(
        mut,
        address = dao_config.treasury @ ErrorCode::InvalidTreasury
    )]
    /// CHECK: This is the SOL treasury PDA validated by address constraint
    pub treasury: UncheckedAccount<'info>,
    // Optional member account for vote weight bonuses
    #[account(
        seeds = [b"member", dao_config.key().as_ref(), voter.key().as_ref()],
        bump = member.bump
    )]
    pub member: Option<Account<'info, Member>>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn cast_vote(ctx: Context<CastVote>, choice: VoteChoice) -> Result<()> {
    if ctx.accounts.dao_config.paused {
        return Err(ErrorCode::Paused.into());
    }

    let proposal = &mut ctx.accounts.proposal;
    let now = ctx.accounts.clock.unix_timestamp;
    
    if now < proposal.start_ts || now >= proposal.end_ts || proposal.state != ProposalState::Active {
        return Err(ErrorCode::VotingWindowClosed.into());
    }

    let vote_record = &mut ctx.accounts.vote_record;
    if vote_record.voter != Pubkey::default() {
        return Err(ErrorCode::AlreadyVoted.into());
    }

    // Calculate vote fee (premium members get discount)
    let mut vote_fee = ctx.accounts.dao_config.vote_fee_lamports;
    if let Some(member) = &ctx.accounts.member {
        if member.premium {
            vote_fee = vote_fee / 2; // 50% discount for premium members
        }
    }

    // Transfer SOL vote fee
    if vote_fee > 0 {
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.voter.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            vote_fee,
        )?;
    }

    // Calculate vote weight (base 1 + premium bonus)
    let mut weight: u64 = 1;
    if let Some(member) = &ctx.accounts.member {
        if member.premium {
            weight = weight.checked_add(1).ok_or(ErrorCode::ArithmeticOverflow)?; // Premium gets +1 weight
        }
    }
    
    // TODO: Add staking CPI for additional weight
    // if let Some(stake_position) = &ctx.accounts.stake_position {
    //     let stake_weight = stake_position.amount / ctx.accounts.dao_config.weight_params;
    //     weight = weight.checked_add(stake_weight).ok_or(ErrorCode::ArithmeticOverflow)?;
    // }

    if weight == 0 {
        return Err(ErrorCode::InvalidVoteWeight.into());
    }

    vote_record.proposal = proposal.key();
    vote_record.voter = ctx.accounts.voter.key();
    vote_record.choice = choice;
    vote_record.weight = weight;
    vote_record.paid_fee = true;
    vote_record.timestamp = now;
    vote_record.bump = ctx.bumps.vote_record;

    // Update proposal tallies with overflow protection
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
    
    proposal.total_votes = proposal.total_votes
        .checked_add(weight)
        .ok_or(ErrorCode::ArithmeticOverflow)?;

    emit!(VoteCast {
        id: proposal.key(),
        voter: vote_record.voter,
        choice: vote_record.choice,
        weight: vote_record.weight,
        timestamp: now,
    });

    Ok(())
}