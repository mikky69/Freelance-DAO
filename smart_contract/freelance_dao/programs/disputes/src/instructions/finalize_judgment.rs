use crate::error::DisputeError;
use crate::events::DisputeJudged;
use crate::state::{
    AdminConfig, Dispute, DisputePanel, DisputeState, Judgment, JudgmentChoice, PanelVoteRecord,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct FinalizeJudgment<'info> {
    #[account(mut)]
    pub finalizer: Signer<'info>,

    #[account(
        seeds = [b"admin_config"],
        bump = admin_config.bump,
        constraint = admin_config.authority == finalizer.key() @ DisputeError::Unauthorized
    )]
    pub admin_config: Account<'info, AdminConfig>,

    #[account(
        mut,
        constraint = dispute.state == DisputeState::PanelFormed || dispute.state == DisputeState::Deliberating @ DisputeError::InvalidDisputeState,
        constraint = dispute.judgment.is_none() @ DisputeError::JudgmentAlreadyFinalized
    )]
    pub dispute: Account<'info, Dispute>,

    #[account(
        seeds = [b"panel", &dispute.id.to_le_bytes()[..]],
        bump = panel.bump
    )]
    pub panel: Account<'info, DisputePanel>,
}

pub fn handler<'info>(ctx: Context<'_, '_, 'info, 'info, FinalizeJudgment<'info>>) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute;
    let panel = &ctx.accounts.panel;
    let clock = Clock::get()?;

    // Check panel hasn't expired
    require!(
        clock.unix_timestamp < panel.expires_at,
        DisputeError::DisputeExpired
    );

    // Check quorum reached
    require!(
        panel.total_votes_cast >= dispute.required_quorum,
        DisputeError::QuorumNotReached
    );

    // Tally votes from remaining accounts
    let mut client_votes: u32 = 0;
    let mut freelancer_votes: u32 = 0;
    let mut split_votes: u32 = 0;
    let mut total_weighted: u32 = 0;

    // Iterate through remaining accounts (vote records)
    for account_info in ctx.remaining_accounts.iter() {
        // Deserialize vote record
        let vote_record: Account<PanelVoteRecord> = Account::try_from(account_info)?;

        // Validate this vote belongs to this dispute
        require!(
            vote_record.dispute_id == dispute.id,
            DisputeError::InvalidVoteRecord
        );

        // Validate voter is panel member
        require!(
            panel.is_member(&vote_record.voter),
            DisputeError::NotPanelMember
        );

        // UPDATED SECTION: Enhanced overflow protection
        let weight = vote_record.weight as u32;

        // Add overflow check before adding
        let new_total = total_weighted
            .checked_add(weight)
            .ok_or(DisputeError::ArithmeticOverflow)?;

        // Also check against expected maximum to prevent vote stuffing
        require!(
            new_total <= panel.weighted_votes_cast,
            DisputeError::VoteMismatch
        );

        total_weighted = new_total;

        match vote_record.choice {
            JudgmentChoice::Client => {
                client_votes = client_votes
                    .checked_add(weight)
                    .ok_or(DisputeError::ArithmeticOverflow)?;
            }
            JudgmentChoice::Freelancer => {
                freelancer_votes = freelancer_votes
                    .checked_add(weight)
                    .ok_or(DisputeError::ArithmeticOverflow)?;
            }
            JudgmentChoice::Split(_) => {
                split_votes = split_votes
                    .checked_add(weight)
                    .ok_or(DisputeError::ArithmeticOverflow)?;
            }
        }
    }

    // Verify vote count matches panel records exactly
    require!(
        total_weighted == panel.weighted_votes_cast,
        DisputeError::VoteMismatch
    );

    // Determine winner (simple majority)
    let winning_choice = if client_votes > freelancer_votes && client_votes > split_votes {
        JudgmentChoice::Client
    } else if freelancer_votes > client_votes && freelancer_votes > split_votes {
        JudgmentChoice::Freelancer
    } else if split_votes > client_votes && split_votes > freelancer_votes {
        JudgmentChoice::Split(50) // Default 50-50 split
    } else {
        // Tie-breaker: favor split
        JudgmentChoice::Split(50)
    };

    dispute.judgment = Some(Judgment {
        choice: winning_choice.clone(),
        finalized_at: clock.unix_timestamp,
    });
    dispute.state = DisputeState::Judged;

    emit!(DisputeJudged {
        dispute_id: dispute.id,
        judgment: winning_choice,
        total_votes: panel.total_votes_cast,
        weighted_votes: panel.weighted_votes_cast,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
