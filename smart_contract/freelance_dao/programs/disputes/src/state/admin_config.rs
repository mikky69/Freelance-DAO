use anchor_lang::prelude::*;

#[account]
pub struct AdminConfig {
    pub authority: Pubkey,
    pub bump: u8,
}

impl AdminConfig {
    pub const SPACE: usize = 8 + 32 + 1 + 8; // discriminator + authority + bump + padding
}
