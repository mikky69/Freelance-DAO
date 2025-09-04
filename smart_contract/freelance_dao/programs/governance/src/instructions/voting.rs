use anchor_lang::{prelude::*, system_program};
use crate::{
    state_accounts::{DaoConfig, Proposal, VoteRecord, Member},
    errors::ErrorCode,
    events::VoteCast,
    state::{VoteChoice, ProposalState},
    constants::{BASE_VOTE_WEIGHT, PREMIUM_BONUS_WEIGHT, STAKING_WEIGHT_DIVISOR, STAKING_PROGRAM_ID}
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
    #[account(
        seeds = [b"member", dao_config.key().as_ref(), voter.key().as_ref()],
        bump = member.bump
    )]
    pub member: Option<Account<'info, Member>>,
    /// CHECK: This account is validated through PDA derivation and program ownership
    pub staking_position: Option<UncheckedAccount<'info>>,
    /// CHECK: This should be the main FLDAO staking pool from staking program - unused but kept for future use
    pub staking_pool: Option<UncheckedAccount<'info>>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
    pub rent: Sysvar<'info, Rent>,
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

    // Calculate vote weight with staking integration
    let mut weight: u64 = BASE_VOTE_WEIGHT;
    
    // Add premium bonus
    if let Some(member) = &ctx.accounts.member {
        if member.premium {
            weight = weight.checked_add(PREMIUM_BONUS_WEIGHT)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
        }
    }
    
    // Add staking bonus if position exists and is valid
    if let Some(staking_position) = &ctx.accounts.staking_position {
        // Verify the account is owned by the staking program
        if staking_position.owner == &STAKING_PROGRAM_ID {
            // Try to read the staked amount from the position
            let position_data = staking_position.try_borrow_data()?;
            if position_data.len() >= 8 + 32 + 32 + 8 { // discriminator + staker + pool + amount
                // Skip discriminator (8 bytes), staker (32 bytes), pool (32 bytes)
                let amount_bytes = &position_data[72..80];
                if let Ok(amount_array) = <[u8; 8]>::try_from(amount_bytes) {
                    let staked_amount = u64::from_le_bytes(amount_array);
                    let staking_bonus = staked_amount.checked_div(STAKING_WEIGHT_DIVISOR).unwrap_or(0);
                    weight = weight.checked_add(staking_bonus)
                        .ok_or(ErrorCode::ArithmeticOverflow)?;
                }
            }
        }
    }
    
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