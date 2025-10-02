use anchor_lang::prelude::*;

#[account]
pub struct Counter {
    pub count: u64,
    pub bump: u8,
}

impl Counter {
    pub const SIZE: usize = 8 + 8 + 1;

    /// Safely increment counter with overflow check
    pub fn increment(&mut self) -> Result<()> {
        self.count = self
            .count
            .checked_add(1)
            .ok_or(error!(crate::errors::EscrowError::CounterOverflow))?;
        Ok(())
    }
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
        1 + // bump
        100; // Extra padding for safety

    /// Validates escrow state transitions
    pub fn can_transition_to(&self, new_state: &EscrowState) -> bool {
        match (&self.state, new_state) {
            (EscrowState::Proposed, EscrowState::AwaitingSigs) => true,
            (EscrowState::Proposed, EscrowState::Cancelled) => true,
            (EscrowState::AwaitingSigs, EscrowState::Active) => true,
            (EscrowState::AwaitingSigs, EscrowState::Cancelled) => true,
            (EscrowState::Active, EscrowState::Completed) => true,
            (EscrowState::Active, EscrowState::Cancelled) => true,
            (EscrowState::Active, EscrowState::Disputed) => true,
            _ => false,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum EscrowState {
    Proposed,
    AwaitingSigs,
    Active,
    Completed,
    Disputed,
    Cancelled,
}
