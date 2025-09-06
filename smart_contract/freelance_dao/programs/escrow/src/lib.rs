#![allow(unused_imports)]

use anchor_lang::prelude::*;
use instructions::*;
use state::{EscrowAccount, EscrowState, Counter};
use events::{EscrowCreated, ProposalAccepted, SignatureSubmitted, EscrowActivated, EscrowCompleted, EscrowCancelled};

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

declare_id!("5WWu5uNgBwop6etUhEpbVAt88M2RdDvz9vKHsyBE3rZg");

#[program]
pub mod escrow {
    use super::*;

    pub fn init_counter(ctx: Context<InitCounter>) -> Result<()> {
        instructions::init::init_counter(ctx)
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        escrow_id: u64,
        amount: u64,
    ) -> Result<()> {
        instructions::escrow::create_proposal(ctx, escrow_id, amount)
    }

    pub fn accept_proposal(ctx: Context<AcceptProposal>) -> Result<()> {
        instructions::escrow::accept_proposal(ctx)
    }

    pub fn submit_signature(
        ctx: Context<SubmitSignature>,
        signature_data: [u8; 64],
    ) -> Result<()> {
        instructions::signatures::submit_signature(ctx, signature_data)
    }

    pub fn complete_escrow(ctx: Context<CompleteEscrow>) -> Result<()> {
        instructions::escrow::complete_escrow(ctx)
    }

    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        instructions::escrow::cancel_escrow(ctx)
    }
}
