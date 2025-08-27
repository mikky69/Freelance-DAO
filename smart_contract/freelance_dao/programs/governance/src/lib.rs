use anchor_lang::prelude::*;
use instructions::*;

pub mod accounts;
pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use errors::*;
pub use events::*;
pub use state::*;

declare_id!("FHz9LEX7bDh85GhtdUiHD7RsNKDuZEdD4afU9FiAv9YT");

#[program]
pub mod governance {
    use super::*;

    pub fn init_dao_config(
        ctx: Context<InitDaoConfig>,
        light_fee_usdc: u64,
        major_fee_usdc: u64,
        vote_fee_lamports: u64,
        min_vote_duration: i64,
        max_vote_duration: i64,
        eligibility_flags: u8,
    ) -> Result<()> {
        instructions::init::init_dao_config(
            ctx,
            light_fee_usdc,
            major_fee_usdc,
            vote_fee_lamports,
            min_vote_duration,
            max_vote_duration,
            eligibility_flags,
        )
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        kind: ProposalKind,
        uri: String,
        title_hash: [u8; 32],
        window: i64,
    ) -> Result<()> {
        instructions::proposals::create_proposal(ctx, kind, uri, title_hash, window)
    }

    pub fn cast_vote(ctx: Context<CastVote>, choice: VoteChoice) -> Result<()> {
        instructions::voting::cast_vote(ctx, choice)
    }

    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        instructions::proposals::finalize_proposal(ctx)
    }

    pub fn set_member_premium(ctx: Context<SetMemberPremium>, is_premium: bool) -> Result<()> {
        instructions::membership::set_member_premium(ctx, is_premium)
    }

    pub fn update_reputation(ctx: Context<UpdateReputation>, score: u64) -> Result<()> {
        instructions::membership::update_reputation(ctx, score)
    }
}