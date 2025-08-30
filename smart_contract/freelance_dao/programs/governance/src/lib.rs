use anchor_lang::prelude::*;

pub mod state_accounts;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("FXrY4VRkPRYzmZCEKoZ9EpBmMarK1QbnVKNU1ygdisbk");

#[allow(unexpected_cfgs)] // Suppress cfg warnings
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
        kind: state::ProposalKind,
        uri: String,
        title_hash: [u8; 32],
        window: i64,
    ) -> Result<()> {
        instructions::proposals::create_proposal(ctx, kind, uri, title_hash, window)
    }

    pub fn cast_vote(ctx: Context<CastVote>, choice: state::VoteChoice) -> Result<()> {
        instructions::voting::cast_vote(ctx, choice)
    }

    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        instructions::proposals::finalize_proposal(ctx)
    }

    pub fn set_params(
        ctx: Context<SetParams>,
        light_fee_usdc: Option<u64>,
        major_fee_usdc: Option<u64>,
        vote_fee_lamports: Option<u64>,
        min_vote_duration: Option<i64>,
        max_vote_duration: Option<i64>,
        eligibility_flags: Option<u8>,
        weight_params: Option<u64>,
    ) -> Result<()> {
        instructions::admin::set_params(
            ctx,
            light_fee_usdc,
            major_fee_usdc,
            vote_fee_lamports,
            min_vote_duration,
            max_vote_duration,
            eligibility_flags,
            weight_params,
        )
    }

    pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
        instructions::admin::set_pause(ctx, paused)
    }
}