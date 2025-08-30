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
    pub weight_params: u64,          // 8 bytes - For vote weight calc (e.g., 1 per X $FLDAO)
    pub bump: [u8; 1],              // 1 byte
}

impl DaoConfig {
    // CORRECTED space calculation
    // Discriminator: 8 bytes
    // 4 Pubkeys: 32 * 4 = 128 bytes
    // 5 u64s (light_fee_usdc, major_fee_usdc, vote_fee_lamports, proposal_count, weight_params): 8 * 5 = 40 bytes
    // 2 i64s (min_vote_duration, max_vote_duration): 8 * 2 = 16 bytes
    // 1 u8 (eligibility_flags): 1 byte
    // 1 bool (paused): 1 byte
    // 1 bump array: 1 byte
    // Total: 8 + 128 + 40 + 16 + 1 + 1 + 1 = 195 bytes
    // Add padding for safety: 8 bytes
    pub const SPACE: usize = 8 + 32 * 4 + 8 * 5 + 8 * 2 + 1 + 1 + 1 + 8;
}

#[account]
#[derive(Default)]
pub struct Proposal {
    pub creator: Pubkey,             // 32 bytes
    pub id: u64,                     // 8 bytes
    pub kind: crate::state::ProposalKind,  // 1 byte
    pub title_hash: [u8; 32],        // 32 bytes
    pub uri: String,                 // 4 + uri_len bytes - Max len check in ix
    pub state: crate::state::ProposalState, // 1 byte
    pub start_ts: i64,               // 8 bytes
    pub end_ts: i64,                 // 8 bytes
    pub tally_yes: u64,              // 8 bytes
    pub tally_no: u64,               // 8 bytes
    pub bump: [u8; 1],              // 1 byte
}

impl Proposal {
    pub fn space(uri_len: usize) -> usize {
        // CORRECTED space calculation
        // Discriminator: 8 bytes
        // creator (Pubkey): 32 bytes
        // id (u64): 8 bytes
        // kind (enum): 1 byte
        // title_hash: 32 bytes
        // uri (String): 4 (length prefix) + uri_len bytes
        // state (enum): 1 byte
        // start_ts (i64): 8 bytes
        // end_ts (i64): 8 bytes
        // tally_yes (u64): 8 bytes
        // tally_no (u64): 8 bytes
        // bump: 1 byte
        // Padding for safety: 8 bytes
        8 + 32 + 8 + 1 + 32 + 4 + uri_len + 1 + 8 + 8 + 8 + 8 + 1 + 8
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
    pub bump: [u8; 1],              // 1 byte
}

impl VoteRecord {
    // CORRECTED space calculation
    // Discriminator: 8 bytes
    // 2 Pubkeys: 32 * 2 = 64 bytes
    // choice (enum): 1 byte
    // weight (u64): 8 bytes
    // paid_fee (bool): 1 byte
    // bump: 1 byte
    // Padding for safety: 8 bytes
    // Total: 8 + 64 + 1 + 8 + 1 + 1 + 8 = 91 bytes
    pub const SPACE: usize = 8 + 32 * 2 + 1 + 8 + 1 + 1 + 8;
}