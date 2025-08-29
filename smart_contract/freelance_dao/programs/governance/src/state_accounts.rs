use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct DaoConfig {
    pub usdc_mint: Pubkey,
    pub treasury: Pubkey, // SOL treasury PDA
    pub usdc_treasury: Pubkey, // USDC ATA for treasury
    pub light_fee_usdc: u64,
    pub major_fee_usdc: u64,
    pub vote_fee_lamports: u64,
    pub min_vote_duration: i64,
    pub max_vote_duration: i64,
    pub admin: Pubkey,
    pub eligibility_flags: u8,
    pub paused: bool,
    pub proposal_count: u64,
    pub weight_params: u64, // For vote weight calc (e.g., 1 per X $FLDAO)
    pub bump: [u8; 1],
}

impl DaoConfig {
    // FIX: Correct space calculation
    // Discriminator: 8 bytes
    // 4 Pubkeys: 32 * 4 = 128 bytes
    // 6 u64s: 8 * 6 = 48 bytes
    // 1 u8: 1 byte
    // 1 bool: 1 byte
    // bump: 1 byte
    // Total: 8 + 128 + 48 + 1 + 1 + 1 = 187 bytes
    pub const SPACE: usize = 8 + 32 * 4 + 8 * 6 + 1 + 1 + 1;
}

#[account]
#[derive(Default)]
pub struct Proposal {
    pub creator: Pubkey,
    pub id: u64,
    pub kind: crate::state::ProposalKind,
    pub title_hash: [u8; 32],
    pub uri: String, // Max len check in ix
    pub state: crate::state::ProposalState,
    pub start_ts: i64,
    pub end_ts: i64,
    pub tally_yes: u64,
    pub tally_no: u64,
    pub bump: [u8; 1],
}

impl Proposal {
    pub fn space(uri_len: usize) -> usize {
        // FIX: More accurate space calculation
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
        8 + 32 + 8 + 1 + 32 + 4 + uri_len + 1 + 8 + 8 + 8 + 8 + 1
    }
}

#[account]
#[derive(Default)]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub choice: crate::state::VoteChoice,
    pub weight: u64,
    pub paid_fee: bool,
    pub bump: [u8; 1],
}

impl VoteRecord {
    // FIX: Correct space calculation
    // Discriminator: 8 bytes
    // 2 Pubkeys: 32 * 2 = 64 bytes
    // choice (enum): 1 byte
    // weight (u64): 8 bytes
    // paid_fee (bool): 1 byte
    // bump: 1 byte
    // Total: 8 + 64 + 1 + 8 + 1 + 1 = 83 bytes
    pub const SPACE: usize = 8 + 32 * 2 + 1 + 8 + 1 + 1;
}