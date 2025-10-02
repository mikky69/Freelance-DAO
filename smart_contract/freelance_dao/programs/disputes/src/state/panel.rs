use anchor_lang::prelude::*;

#[account]
pub struct DisputePanel {
    pub dispute_id: u64,
    pub members: Vec<Pubkey>,
    pub weights: Vec<u16>,      // Voting weight for each member
    pub selection_seed: u64,    // Seed used for deterministic selection
    pub expires_at: i64,        // When panel expires
    pub total_votes_cast: u16,  // Track votes cast
    pub weighted_votes_cast: u32, // Track weighted votes cast
    pub bump: u8,
}

impl DisputePanel {
    pub const MAX_PANEL_SIZE: usize = 7;
    
    pub fn space() -> usize {
        8 + // discriminator
        8 + // dispute_id
        4 + (32 * Self::MAX_PANEL_SIZE) + // members (vec + items)
        4 + (2 * Self::MAX_PANEL_SIZE) + // weights (vec + items)
        8 + // selection_seed
        8 + // expires_at
        2 + // total_votes_cast
        4 + // weighted_votes_cast
        1 + // bump
        32  // padding
    }
    
    pub fn is_member(&self, member: &Pubkey) -> bool {
        self.members.contains(member)
    }
    
    pub fn get_member_weight(&self, member: &Pubkey) -> Option<u16> {
        self.members
            .iter()
            .position(|m| m == member)
            .map(|idx| self.weights[idx])
    }
}
