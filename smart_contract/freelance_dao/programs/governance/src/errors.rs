use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Only admin can call this instruction")]
    Unauthorized,
    #[msg("Insufficient USDC or SOL fees")]
    InsufficientFees,
    #[msg("Voting window is closed")]
    VotingWindowClosed,
    #[msg("Voter has already cast a vote")]
    AlreadyVoted,
    #[msg("Program is paused")]
    Paused,
    #[msg("Voting window duration is invalid")]
    InvalidWindow,
    #[msg("URI exceeds maximum length")]
    UriTooLong,
    #[msg("Not eligible to create proposal")]
    NotEligible,
}