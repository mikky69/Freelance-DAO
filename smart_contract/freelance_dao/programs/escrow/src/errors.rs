use anchor_lang::prelude::*;

#[error_code]
pub enum EscrowError {
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Invalid escrow state for this operation")]
    InvalidState,
    #[msg("Signature already submitted by this party")]
    SignatureAlreadySubmitted,
    #[msg("Insufficient funds in escrow")]
    InsufficientFunds,
    #[msg("Invalid signature format or entropy")]
    InvalidSignature,
    #[msg("Escrow amount too small, minimum 0.001 SOL required")]
    AmountTooSmall,
    #[msg("Both signatures required to activate escrow")]
    BothSignaturesRequired,
    #[msg("Invalid freelancer address provided")]
    InvalidFreelancer,
    #[msg("Cannot cancel escrow in current state or you're not authorized")]
    CannotCancel,
    #[msg("Arithmetic overflow occurred")]
    ArithmeticOverflow,
    #[msg("Account must maintain rent exemption")]
    RentExemptionViolation,
    #[msg("Invalid timestamp detected")]
    InvalidTimestamp,
    #[msg("Counter overflow - maximum escrows reached")]
    CounterOverflow,
}
