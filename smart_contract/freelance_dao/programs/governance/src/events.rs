use anchor_lang::prelude::*;
use crate::state::{ProposalKind, ProposalState, VoteChoice};

#[event]
pub struct ProposalCreated {
    pub id: Pubkey,
    pub creator: Pubkey,
    pub kind: ProposalKind,
    pub title_hash: [u8; 32],
}

#[event]
pub struct ProposalFinalized {
    pub id: Pubkey,
    pub result: ProposalState,
    pub total_votes: u64,
    pub yes_votes: u64,
    pub no_votes: u64,
}

#[event]
pub struct ProposalExecuted {
    pub id: Pubkey,
    pub executor: Pubkey,
    pub executed_at: i64,
}

#[event]
pub struct VoteCast {
    pub id: Pubkey,
    pub voter: Pubkey,
    pub choice: VoteChoice,
    pub weight: u64,
    pub timestamp: i64,
}

#[event]
pub struct MembershipChanged {
    pub user: Pubkey,
    pub premium: bool,
    pub flags: u8,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryWithdrawal {
    pub amount: u64,
    pub token_type: String, // "SOL" or "USDC"
    pub destination: Pubkey,
    pub admin: Pubkey,
}