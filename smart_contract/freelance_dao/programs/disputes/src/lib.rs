use anchor_lang::prelude::*;

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("ABBDsuMJ3nNy17F53dAGDacXBtL5yUSB7ZjhebyRHmkH");
pub const ESCROW_PROGRAM_ID: Pubkey = pubkey!("5WWu5uNgBwop6etUhEpbVAt88M2RdDvz9vKHsyBE3rZg");

#[program]
pub mod disputes {
    use super::*;

    /// Initialize the dispute counter and admin config (ONE TIME ONLY)
    pub fn init_counter(ctx: Context<InitCounter>) -> Result<()> {
        instructions::init_counter::handler(ctx)
    }

    pub fn open_dispute(
        ctx: Context<OpenDispute>,
        parties: Vec<Pubkey>,
        uri: String,
        linked_escrow: Option<Pubkey>,
    ) -> Result<()> {
        instructions::open_dispute::handler(ctx, parties, uri, linked_escrow)
    }

    pub fn form_panel(
        ctx: Context<FormPanel>,
        members: Vec<Pubkey>,
        selection_seed: u64,
        required_quorum: u16,
    ) -> Result<()> {
        instructions::form_panel::handler(ctx, members, selection_seed, required_quorum)
    }

    pub fn cast_panel_vote(ctx: Context<PanelVote>, choice: state::JudgmentChoice) -> Result<()> {
        instructions::panel_vote::handler(ctx, choice)
    }

    pub fn finalize_judgment<'info>(
        ctx: Context<'_, '_, 'info, 'info, FinalizeJudgment<'info>>,
    ) -> Result<()> {
        instructions::finalize_judgment::handler(ctx)
    }

    pub fn execute_judgment(ctx: Context<ExecuteJudgment>) -> Result<()> {
        instructions::execute_judgment::handler(ctx)
    }

    // ADD THIS NEW INSTRUCTION
    pub fn cancel_dispute(ctx: Context<CancelDispute>) -> Result<()> {
        instructions::cancel_dispute::handler(ctx)
    }
}
