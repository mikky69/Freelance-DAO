use anchor_lang::prelude::*;
use crate::state::{ProposalKind, ProposalState, VoteChoice};

#[event]
pub struct ProposalCreated {
    pub id: Pubkey,
    pub creator: Pubkey,
    pub kind: ProposalKind,
}

#[event]
pub struct ProposalFinalized {
    pub id: Pubkey,
    pub result: ProposalState,
}

#[event]
pub struct VoteCast {
    pub id: Pubkey,
    pub voter: Pubkey,
    pub choice: VoteChoice,
    pub weight: u64,
}