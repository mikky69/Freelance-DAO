use anchor_lang::prelude::*;

#[error_code]
pub enum DisputeError {
    #[msg("Invalid dispute state for this operation")]
    InvalidDisputeState,

    #[msg("Only panel members can vote")]
    NotPanelMember,

    #[msg("Panel member has already voted")]
    AlreadyVoted,

    #[msg("Dispute has expired")]
    DisputeExpired,

    #[msg("Invalid panel size")]
    InvalidPanelSize,

    #[msg("Quorum not reached")]
    QuorumNotReached,

    #[msg("Invalid parties - must have at least 2")]
    InvalidParties,

    #[msg("URI too long")]
    UriTooLong,

    #[msg("Panel already formed")]
    PanelAlreadyFormed,

    #[msg("Panel selection seed already used")]
    SeedAlreadyUsed,

    #[msg("Invalid judgment choice")]
    InvalidJudgmentChoice,

    #[msg("Judgment already executed")]
    JudgmentAlreadyExecuted,

    #[msg("Unauthorized: Only admin can perform this action")]
    Unauthorized,

    #[msg("Duplicate panel members not allowed")]
    DuplicatePanelMembers,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Invalid vote record")]
    InvalidVoteRecord,

    #[msg("Vote count mismatch")]
    VoteMismatch,

    #[msg("Judgment already finalized")]
    JudgmentAlreadyFinalized,

    // ADD THESE NEW ERROR CODES
    #[msg("Invalid escrow account provided")]
    InvalidEscrowAccount,

    #[msg("Cannot cancel dispute in current state")]
    CannotCancel,

    #[msg("Only dispute opener can cancel before panel formation")]
    UnauthorizedCancel,

    #[msg("Invalid panel weights")]
    InvalidPanelWeights,
}
