use anchor_lang::prelude::*;

#[error_code]
pub enum EscrowError {
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Invalid escrow state")]
    InvalidState,
    #[msg("Signature already submitted")]
    SignatureAlreadySubmitted,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid signature format")]
    InvalidSignature,
    #[msg("Escrow amount too small")]
    AmountTooSmall,
    #[msg("Both signatures required")]
    BothSignaturesRequired,
    #[msg("Invalid freelancer")]
    InvalidFreelancer,
    #[msg("Cannot cancel escrow in current state or you're not authorized")]
    CannotCancel,
}