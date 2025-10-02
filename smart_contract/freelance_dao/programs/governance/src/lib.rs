use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;
pub mod state_accounts;
pub mod utils;

use instructions::*;
pub use utils::*;

declare_id!("BjBY39wjLfMvAQDpKZajwNm75msab2ie5k7b2tQYFFjC");

#[program]
pub mod governance {
    use super::*;

    // Core governance functions
    pub fn init_dao_config(
        ctx: Context<InitDaoConfig>,
        light_fee_usdc: u64,
        major_fee_usdc: u64,
        vote_fee_lamports: u64,
        min_vote_duration: i64,
        max_vote_duration: i64,
        eligibility_flags: u8,
        quorum_threshold: u64,
        approval_threshold: u64,
    ) -> Result<()> {
        instructions::init::init_dao_config(
            ctx,
            light_fee_usdc,
            major_fee_usdc,
            vote_fee_lamports,
            min_vote_duration,
            max_vote_duration,
            eligibility_flags,
            quorum_threshold,
            approval_threshold,
        )
    }

    pub fn init_treasury(ctx: Context<InitTreasury>) -> Result<()> {
        instructions::treasury::init_treasury(ctx)
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

    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
        instructions::proposals::cancel_proposal(ctx)
    }

    pub fn cast_vote(ctx: Context<CastVote>, choice: state::VoteChoice) -> Result<()> {
        instructions::voting::cast_vote(ctx, choice)
    }

    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        instructions::proposals::finalize_proposal(ctx)
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        instructions::execution::execute_proposal(ctx)
    }

    pub fn execute_param_change(
        ctx: Context<ExecuteParamChange>,
        new_light_fee: Option<u64>,
        new_major_fee: Option<u64>,
        new_vote_fee: Option<u64>,
    ) -> Result<()> {
        instructions::execution::execute_param_change(
            ctx,
            new_light_fee,
            new_major_fee,
            new_vote_fee,
        )
    }

    // Admin functions
    pub fn set_params(
        ctx: Context<SetParams>,
        light_fee_usdc: Option<u64>,
        major_fee_usdc: Option<u64>,
        vote_fee_lamports: Option<u64>,
        min_vote_duration: Option<i64>,
        max_vote_duration: Option<i64>,
        eligibility_flags: Option<u8>,
        weight_params: Option<u64>,
        quorum_threshold: Option<u64>,
        approval_threshold: Option<u64>,
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
            quorum_threshold,
            approval_threshold,
        )
    }

    pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
        instructions::admin::set_pause(ctx, paused)
    }

    pub fn transfer_admin(ctx: Context<TransferAdmin>) -> Result<()> {
        instructions::admin::transfer_admin(ctx)
    }

    // Treasury functions
    pub fn withdraw_sol(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
        instructions::treasury::withdraw_sol(ctx, amount)
    }

    pub fn withdraw_usdc(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
        instructions::treasury::withdraw_usdc(ctx, amount)
    }

    // Membership functions
    pub fn set_membership_status(
        ctx: Context<ManageMembership>,
        user: Pubkey,
        premium: bool,
        flags: u8,
    ) -> Result<()> {
        instructions::membership::set_membership_status(ctx, user, premium, flags)
    }

    pub fn check_membership(ctx: Context<CheckMembership>) -> Result<()> {
        instructions::membership::check_membership(ctx)
    }
}
