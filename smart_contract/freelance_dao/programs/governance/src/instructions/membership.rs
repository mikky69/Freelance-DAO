use anchor_lang::prelude::*;
use crate::{state_accounts::{DaoConfig, Member}, errors::ErrorCode, events::MembershipChanged};

#[derive(Accounts)]
#[instruction(user: Pubkey)]
pub struct ManageMembership<'info> {
    #[account(
        seeds = [b"dao_config"],
        bump = dao_config.bump,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(
        init_if_needed,
        payer = admin,
        space = Member::SPACE,
        seeds = [b"member", dao_config.key().as_ref(), user.as_ref()],
        bump
    )]
    pub member: Account<'info, Member>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn set_membership_status(
    ctx: Context<ManageMembership>,
    user: Pubkey,
    premium: bool,
    flags: u8,
) -> Result<()> {
    let member = &mut ctx.accounts.member;
    let now = ctx.accounts.clock.unix_timestamp;
    
    let was_premium = member.premium;
    member.user = user;
    member.premium = premium;
    member.flags = flags;
    member.bump = ctx.bumps.member;
    
    if member.joined_at == 0 {
        member.joined_at = now;
    }
    
    if was_premium != premium {
        member.updated_at = now;
    }
    
    emit!(MembershipChanged {
        user,
        premium,
        flags,
        timestamp: now,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct CheckMembership<'info> {
    #[account(
        seeds = [b"dao_config"],
        bump = dao_config.bump
    )]
    pub dao_config: Account<'info, DaoConfig>,
    #[account(
        seeds = [b"member", dao_config.key().as_ref(), user.key().as_ref()],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,
    pub user: Signer<'info>,
}

// This is a view function - doesn't modify state
pub fn check_membership(_ctx: Context<CheckMembership>) -> Result<()> {
    // The constraints already validate the member exists
    // Return value would be handled by client reading the account
    Ok(())
}