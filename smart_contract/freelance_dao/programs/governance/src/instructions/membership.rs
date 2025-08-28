use anchor_lang::prelude::*;
use crate::{account_structs::*, constants::*, errors::ErrorCode};

#[derive(Accounts)]
pub struct SetMemberPremium<'info> {
    #[account(
        seeds = [DAO_CONFIG_SEED],
        bump = dao_config.bump,
        constraint = dao_config.admin == admin.key() @ ErrorCode::Unauthorized
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + 32 + 1 + 8 + 8 + 1,
        seeds = [MEMBER_SEED, &member_wallet.key().to_bytes()[..]],
        bump
    )]
    pub member: Account<'info, Member>,
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: Just a wallet address, no constraints needed
    pub member_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    #[account(
        seeds = [DAO_CONFIG_SEED],
        bump = dao_config.bump,
        constraint = dao_config.admin == admin.key() @ ErrorCode::Unauthorized
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(
        mut,
        seeds = [MEMBER_SEED, &member_wallet.key().to_bytes()[..]],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: Just a wallet address
    pub member_wallet: AccountInfo<'info>,
}

pub fn set_member_premium(ctx: Context<SetMemberPremium>, is_premium: bool) -> Result<()> {
    let member = &mut ctx.accounts.member;
    member.wallet = ctx.accounts.member_wallet.key();
    member.is_premium = is_premium;
    member.reputation_score = 0;
    member.joined_at = ctx.accounts.clock.unix_timestamp;
    member.bump = ctx.bumps.member;
    Ok(())
}

pub fn update_reputation(ctx: Context<UpdateReputation>, score: u64) -> Result<()> {
    let member = &mut ctx.accounts.member;
    member.reputation_score = score;
    Ok(())
}