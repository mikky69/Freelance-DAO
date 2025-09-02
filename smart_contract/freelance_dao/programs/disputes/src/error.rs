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
}
