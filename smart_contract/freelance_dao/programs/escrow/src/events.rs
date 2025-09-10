use anchor_lang::prelude::*;

#[event]
pub struct EscrowCreated {
    pub escrow_id: u64,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct ProposalAccepted {
    pub escrow_id: u64,
    pub freelancer: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct SignatureSubmitted {
    pub escrow_id: u64,
    pub signer: Pubkey,
    pub is_client: bool,
    pub timestamp: i64,
}

#[event]
pub struct EscrowActivated {
    pub escrow_id: u64,
    pub timestamp: i64,
}

#[event]
pub struct EscrowCompleted {
    pub escrow_id: u64,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct EscrowCancelled {
    pub escrow_id: u64,
    pub timestamp: i64,
}
