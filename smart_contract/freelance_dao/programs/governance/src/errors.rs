use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid instruction data")]
    InvalidInstructionData,
    #[msg("Proposal voting period has ended")]
    VotingPeriodEnded,
    #[msg("Proposal voting period has not ended")]
    VotingPeriodNotEnded,
    #[msg("Already voted on this proposal")]
    AlreadyVoted,
    #[msg("Proposal has not succeeded")]
    ProposalNotSucceeded,
    #[msg("Proposal already executed")]
    AlreadyExecuted,
    #[msg("Proposal not executed yet")]
    NotExecuted,
    #[msg("Execution delay period not met")]
    ExecutionDelayNotMet,
    #[msg("Insufficient voting power")]
    InsufficientVotingPower,
    #[msg("Invalid proposal type")]
    InvalidProposalType,
    #[msg("Invalid voting period")]
    InvalidVotingPeriod,
    #[msg("Member not found")]
    MemberNotFound,
    #[msg("Not a premium member")]
    NotPremiumMember,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid window or time parameter")]
    InvalidWindow,
    #[msg("Invalid treasury account")]
    InvalidTreasury,
    #[msg("DAO operations are paused")]
    Paused,
    #[msg("URI too long")]
    UriTooLong,
    #[msg("Invalid title hash")]
    InvalidTitleHash,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Proposal not active")]
    ProposalNotActive,
    #[msg("Voting window closed")]
    VotingWindowClosed,
    #[msg("Voting still active")]
    VotingStillActive,
    #[msg("Invalid vote weight")]
    InvalidVoteWeight,
    #[msg("Invalid staking program")]
    InvalidStakingProgram,
}