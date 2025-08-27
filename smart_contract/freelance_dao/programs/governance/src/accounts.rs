use anchor_lang::prelude::*;

#[account]
pub struct DaoConfig {
    pub usdc_mint: Pubkey,
    pub fee_wallet: Pubkey, // Treasury PDA
    pub light_fee_usdc: u64,
    pub major_fee_usdc: u64,
    pub vote_fee_lamports: u64,
    pub min_vote_duration: i64,
    pub max_vote_duration: i64,
    pub admin: Pubkey,
    pub eligibility_flags: u8, // Bitflags: 1 = premium, 2 = stake
    pub paused: bool,
    pub bump: [u8; 1],
}

#[account]
pub struct Proposal {
    pub creator: Pubkey,
    pub kind: ProposalKind,
    pub title_hash: [u8; 32],
    pub uri: String, // IPFS/Arweave, max 200 chars
    pub state: ProposalState,
    pub start_ts: i64,
    pub end_ts: i64,
    pub tally_yes: u64,
    pub tally_no: u64,
    pub bump: [u8; 1],
}

#[account]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub choice: VoteChoice,
    pub weight: u64,
    pub paid_fee: bool,
    pub bump: [u8; 1],
}

#[account]
pub struct Member {
    pub wallet: Pubkey,
    pub is_premium: bool,
    pub reputation_score: u64, // For Disputes
    pub joined_at: i64,
    pub bump: [u8; 1],
}