use anchor_lang::prelude::*;

#[constant]
pub const ESCROW_SEED: &[u8] = b"escrow";

#[constant]
pub const COUNTER_SEED: &[u8] = b"counter";

#[constant]
pub const MIN_ESCROW_AMOUNT: u64 = 1000000; // 0.001 SOL in lamports

// Regular const for usize - don't use #[constant] with usize
pub const SIGNATURE_SIZE: usize = 64;