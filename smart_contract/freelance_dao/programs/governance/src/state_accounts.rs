// programs/governance/src/state_accounts.rs
use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct DaoConfig {
    pub usdc_mint: Pubkey,           // 32 bytes
    pub treasury: Pubkey,            // 32 bytes - SOL treasury PDA
    pub usdc_treasury: Pubkey,       // 32 bytes - USDC ATA for treasury
    pub staking_treasury: Pubkey,    // 32 bytes - Reference to staking treasury
    pub light_fee_usdc: u64,         // 8 bytes
    pub major_fee_usdc: u64,         // 8 bytes
    pub vote_fee_lamports: u64,      // 8 bytes
    pub min_vote_duration: i64,      // 8 bytes
    pub max_vote_duration: i64,      // 8 bytes
    pub admin: Pubkey,               // 32 bytes
    pub eligibility_flags: u8,       // 1 byte
    pub paused: bool,                // 1 byte
    pub proposal_count: u64,         // 8 bytes
    pub weight_params: u64,          // 8 bytes
    pub quorum_threshold: u64,       // 8 bytes
    pub approval_threshold: u64,     // 8 bytes
    pub bump: u8,                    // 1 byte
}

impl DaoConfig {
    // Updated space calculation to include staking_treasury
    pub const SPACE: usize = 8 + // discriminator
        32 * 5 + // 5 pubkeys (usdc_mint, treasury, usdc_treasury, staking_treasury, admin)
        8 * 8 + // 8 u64/i64 fields
        1 + // eligibility_flags
        1 + // paused
        1 + // bump
        32; // extra padding for safety and alignment
    // Total: 8 + 160 + 64 + 3 + 32 = 267 bytes
}

#[account]
#[derive(Default)]
pub struct Proposal {
    pub creator: Pubkey,             // 32 bytes
    pub id: u64,                     // 8 bytes
    pub kind: crate::state::ProposalKind,  // 1 byte
    pub title_hash: [u8; 32],        // 32 bytes
    pub uri: String,                 // 4 + uri_len bytes
    pub state: crate::state::ProposalState, // 1 byte
    pub start_ts: i64,               // 8 bytes
    pub end_ts: i64,                 // 8 bytes
    pub tally_yes: u64,              // 8 bytes
    pub tally_no: u64,               // 8 bytes
    pub total_votes: u64,            // 8 bytes
    pub executed: bool,              // 1 byte
    pub executed_at: i64,            // 8 bytes
    pub bump: u8,                    // 1 byte
}

impl Proposal {
    pub fn space(uri_len: usize) -> usize {
        8 + // discriminator
        32 + // creator
        8 + // id
        1 + // kind
        32 + // title_hash
        (4 + uri_len) + // uri (String with length prefix)
        1 + // state
        8 + // start_ts
        8 + // end_ts
        8 + // tally_yes
        8 + // tally_no
        8 + // total_votes
        1 + // executed
        8 + // executed_at
        1 + // bump
        32 // extra padding for safety
    }
}

#[account]
#[derive(Default)]
pub struct VoteRecord {
    pub proposal: Pubkey,            // 32 bytes
    pub voter: Pubkey,               // 32 bytes
    pub choice: crate::state::VoteChoice, // 1 byte
    pub weight: u64,                 // 8 bytes
    pub paid_fee: bool,              // 1 byte
    pub timestamp: i64,              // 8 bytes
    pub bump: u8,                    // 1 byte
}

impl VoteRecord {
    pub const SPACE: usize = 8 + // discriminator
        32 + // proposal
        32 + // voter
        1 + // choice
        8 + // weight
        1 + // paid_fee
        8 + // timestamp
        1 + // bump
        16; // padding for safety
}

#[account]
#[derive(Default)]
pub struct Member {
    pub user: Pubkey,                // 32 bytes
    pub premium: bool,               // 1 byte
    pub flags: u8,                   // 1 byte
    pub joined_at: i64,              // 8 bytes
    pub updated_at: i64,             // 8 bytes
    pub bump: u8,                    // 1 byte
}

impl Member {
    pub const SPACE: usize = 8 + // discriminator
        32 + // user
        1 + // premium
        1 + // flags
        8 + // joined_at
        8 + // updated_at
        1 + // bump
        16; // padding for safety
}