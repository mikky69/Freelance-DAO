// state/counter.rs
use anchor_lang::prelude::*;

#[account]
pub struct DisputeCounter {
    pub count: u64,
    pub bump: u8,
}

impl DisputeCounter {
    pub const SPACE: usize = 8 + 8 + 1 + 16; // discriminator + count + bump + padding
    
    pub fn seeds() -> &'static [&'static [u8]] {
        &[b"dispute_counter"]
    }
}