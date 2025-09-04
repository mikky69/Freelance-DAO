use anchor_lang::prelude::*;
use super::JudgmentChoice;

#[account]
pub struct PanelVoteRecord {
    pub dispute_id: u64,
    pub voter: Pubkey,
    pub choice: JudgmentChoice,
    pub weight: u16,
    pub voted_at: i64,
    pub bump: u8,
}

impl PanelVoteRecord {
    pub fn space() -> usize {
        8 + // discriminator
        8 + // dispute_id
        32 + // voter
        1 + 2 + // choice (enum discriminant + max u16)
        2 + // weight
        8 + // voted_at
        1 + // bump
        16  // padding
    }
}
