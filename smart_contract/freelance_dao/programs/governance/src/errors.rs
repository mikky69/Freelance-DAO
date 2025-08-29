use anchor_lang::prelude::*;

#[error_code]
#[derive(PartialEq)]
pub enum ErrorCode {
    #[msg("Only admin can call this instruction")]
    Unauthorized = 6000,
    #[msg("Insufficient USDC or SOL fees")]
    InsufficientFees = 6001,
    #[msg("Voting window is closed or not started")]
    VotingWindowClosed = 6002,
    #[msg("Voter has already cast a vote")]
    AlreadyVoted = 6003,
    #[msg("Program is paused")]
    Paused = 6004,
    #[msg("Voting window duration is invalid")]
    InvalidWindow = 6005,
    #[msg("URI too long")]
    UriTooLong = 6006,
    #[msg("Proposal not active")]
    ProposalNotActive = 6007,
    #[msg("Voting is still active")]
    VotingStillActive = 6008,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow = 6009,
}