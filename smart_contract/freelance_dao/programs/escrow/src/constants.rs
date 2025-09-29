use anchor_lang::prelude::*;

#[constant]
pub const ESCROW_SEED: &[u8] = b"escrow";

#[constant]
pub const COUNTER_SEED: &[u8] = b"counter";

#[constant]
pub const MIN_ESCROW_AMOUNT: u64 = 1_000_000; // 0.001 SOL in lamports

// Maximum reasonable escrow amount (1000 SOL) to prevent fat-finger errors
// Note: Not using #[constant] here to avoid IDL generation issues with large u64
pub const MAX_ESCROW_AMOUNT: u64 = 1_000_000_000_000; // 1000 SOL

// Regular const for usize - don't use #[constant] with usize
pub const SIGNATURE_SIZE: usize = 64;

// Timeout periods (in seconds)
pub const PROPOSAL_TIMEOUT: i64 = 30 * 24 * 60 * 60; // 30 days
pub const SIGNATURE_TIMEOUT: i64 = 7 * 24 * 60 * 60; // 7 days
