use anchor_lang::prelude::*;

#[account]
pub struct Counter {
    pub count: u64,
    pub bump: u8,
}

impl Counter {
    pub const SIZE: usize = 8 + 8 + 1;
}

#[account]
pub struct EscrowAccount {
    pub escrow_id: u64,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub amount: u64,
    pub state: EscrowState,
    pub client_signature: Option<[u8; 64]>,
    pub freelancer_signature: Option<[u8; 64]>,
    pub created_at: i64,
    pub signed_at: Option<i64>,
    pub completed_at: Option<i64>,
    pub bump: u8,
}

impl EscrowAccount {
    pub const SIZE: usize = 8 + // discriminator
        8 + // escrow_id
        32 + // client
        32 + // freelancer  
        8 + // amount
        1 + // state enum
        (1 + 64) + // client_signature Option<[u8; 64]>
        (1 + 64) + // freelancer_signature Option<[u8; 64]>
        8 + // created_at
        (1 + 8) + // signed_at Option<i64>
        (1 + 8) + // completed_at Option<i64>
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowState {
    Proposed,      // Client created proposal
    Accepted,      // Freelancer accepted
    AwaitingSigs,  // Both parties need to sign
    Active,        // Both signed, work can begin
    Completed,     // Work completed, funds released
    Disputed,      // Dispute raised
    Cancelled,     // Cancelled before completion
}