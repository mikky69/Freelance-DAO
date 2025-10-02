use crate::state::DisputeState;
use crate::state::JudgmentChoice;
use anchor_lang::prelude::*; // ADD THIS IMPORT

#[event]
pub struct DisputeOpened {
    pub id: u64,
    pub opened_by: Pubkey,
    pub parties: Vec<Pubkey>,
    pub uri: String,
    pub timestamp: i64,
}

#[event]
pub struct PanelFormed {
    pub dispute_id: u64,
    pub members: Vec<Pubkey>,
    pub panel_size: u16,
    pub required_quorum: u16,
    pub expires_at: i64,
}

#[event]
pub struct PanelVoteCast {
    pub dispute_id: u64,
    pub voter: Pubkey,
    pub choice: JudgmentChoice,
    pub weight: u16,
    pub timestamp: i64,
}

#[event]
pub struct DisputeJudged {
    pub dispute_id: u64,
    pub judgment: JudgmentChoice,
    pub total_votes: u16,
    pub weighted_votes: u32,
    pub timestamp: i64,
}

#[event]
pub struct DisputeExecuted {
    pub dispute_id: u64,
    pub judgment: JudgmentChoice,
    pub linked_escrow: Option<Pubkey>,
    pub timestamp: i64,
}

// ADD THIS NEW EVENT
#[event]
pub struct DisputeCanceled {
    pub dispute_id: u64,
    pub canceled_by: Pubkey,
    pub previous_state: DisputeState,
    pub timestamp: i64,
}
