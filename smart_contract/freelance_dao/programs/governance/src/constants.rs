// Add this to governance/src/constants.rs
use anchor_lang::prelude::*;

// Program IDs for cross-program calls
pub const STAKING_PROGRAM_ID: Pubkey = anchor_lang::pubkey!("DFv6N5EiAueb7xcntYB3ZL49dFbAmgimXsfgwobZpfv9");
pub const DISPUTES_PROGRAM_ID: Pubkey = anchor_lang::pubkey!("AdQN2jzFXvBSmfhwAdKtjouacDKGvMqMnPAayxfmsTYn");

// Default governance parameters
pub const DEFAULT_MIN_VOTE_DURATION: i64 = 86400; // 1 day
pub const DEFAULT_MAX_VOTE_DURATION: i64 = 604800; // 7 days
pub const DEFAULT_QUORUM_THRESHOLD: u64 = 1000; // 1000 votes minimum
pub const DEFAULT_APPROVAL_THRESHOLD: u64 = 5000; // 50% approval (out of 10000)