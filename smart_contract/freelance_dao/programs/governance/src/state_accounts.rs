// UPDATED state_accounts.rs
use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct DaoConfig {
    pub usdc_mint: Pubkey,           // 32 bytes
    pub treasury: Pubkey,            // 32 bytes - SOL treasury PDA
    pub usdc_treasury: Pubkey,       // 32 bytes - USDC ATA for treasury
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
    pub quorum_threshold: u64,       // 8 bytes - NEW
    pub approval_threshold: u64,     // 8 bytes - NEW (percentage, e.g., 5100 = 51%)
    pub bump: u8,                    // 1 byte
}

impl DaoConfig {
    pub const SPACE: usize = 8 + 32 * 4 + 8 * 7 + 1 + 1 + 1 + 8; // Updated for new fields
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
    pub total_votes: u64,            // 8 bytes - NEW
    pub executed: bool,              // 1 byte - NEW
    pub executed_at: i64,            // 8 bytes - NEW
    pub bump: u8,                    // 1 byte
}

impl Proposal {
    pub fn space(uri_len: usize) -> usize {
        // Updated for new fields
        8 + 32 + 8 + 1 + 32 + (4 + uri_len) + 1 + 8 + 8 + 8 + 8 + 8 + 1 + 8 + 1 + 8
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
    pub timestamp: i64,              // 8 bytes - NEW
    pub bump: u8,                    // 1 byte
}

impl VoteRecord {
    pub const SPACE: usize = 8 + 64 + 1 + 8 + 1 + 8 + 1 + 8; // Updated
}

// NEW: Member account for premium membership
#[account]
#[derive(Default)]
pub struct Member {
    pub user: Pubkey,                // 32 bytes
    pub premium: bool,               // 1 byte
    pub flags: u8,                   // 1 byte - Custom flags for different membership levels
    pub joined_at: i64,              // 8 bytes
    pub updated_at: i64,             // 8 bytes
    pub bump: u8,                    // 1 byte
}

impl Member {
    pub const SPACE: usize = 8 + 32 + 1 + 1 + 8 + 8 + 1 + 8; // 67 bytes
}