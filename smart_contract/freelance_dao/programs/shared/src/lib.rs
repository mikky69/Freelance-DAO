use anchor_lang::prelude::*;

declare_id!("4vvGqQjKWJmAmNx1iuNNwpSJrjgVxgr1wSWWA2ZEkfA6");

// Program IDs for cross-program calls
pub const STAKING_PROGRAM_ID: Pubkey = anchor_lang::pubkey!("DFv6N5EiAueb7xcntYB3ZL49dFbAmgimXsfgwobZpfv9");
pub const GOVERNANCE_PROGRAM_ID: Pubkey = anchor_lang::pubkey!("GgkLgFNYnDsCo4w9NKZrjMnhjaJ5F3XjNTMfvGjaxgFf");

// Shared data structures for cross-program communication
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct StakePositionData {
    pub staker: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub accum_points: u128,
    pub last_update_ts: i64,
    pub created_at: i64,
    pub bump: u8,
}

// Vote weight calculation parameters
pub const BASE_VOTE_WEIGHT: u64 = 1;
pub const PREMIUM_BONUS_WEIGHT: u64 = 1;
pub const STAKING_WEIGHT_DIVISOR: u64 = 1_000_000; // 1 FLDAO token = 1 additional vote weight

// Helper functions for cross-program calls
pub mod staking_cpi {
    use super::*;
    
    // Account structure for reading staking position
    #[derive(Accounts)]
    pub struct StakePositionAccount<'info> {
        /// CHECK: This account will be validated by the staking program
        pub position: UncheckedAccount<'info>,
    }
    
    // Helper function to calculate vote weight from staking position
    pub fn calculate_vote_weight_with_staking(
        base_weight: u64,
        premium_bonus: Option<u64>,
        staked_amount: u64,
    ) -> Result<u64> {
        let mut total_weight = base_weight;
        
        // Add premium bonus if applicable
        if let Some(bonus) = premium_bonus {
            total_weight = total_weight
                .checked_add(bonus)
                .ok_or(ProgramError::ArithmeticOverflow)?;
        }
        
        // Add staking bonus
        let staking_bonus = staked_amount
            .checked_div(STAKING_WEIGHT_DIVISOR)
            .unwrap_or(0);
        
        total_weight = total_weight
            .checked_add(staking_bonus)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        
        Ok(total_weight)
    }
}

// Utility functions for PDA derivation
pub fn get_stake_position_pda(pool: &Pubkey, staker: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"position", pool.as_ref(), staker.as_ref()],
        &STAKING_PROGRAM_ID,
    )
}

pub fn get_staking_pool_pda(mint: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"pool", mint.as_ref()],
        &STAKING_PROGRAM_ID,
    )
}

// Minimal program structure to satisfy Anchor's IDL requirements
#[program]
pub mod shared {
    use super::*;
    
    // Dummy instruction - this program is mainly for shared utilities
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Shared utilities initialized");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}