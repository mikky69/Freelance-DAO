use crate::{
    constants::{ABSOLUTE_MIN_VOTE_DURATION, MAX_QUORUM_THRESHOLD},
    errors::ErrorCode,
    state_accounts::DaoConfig,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetParams<'info> {
    #[account(
        mut,
        seeds = [b"dao_config"],
        bump = dao_config.bump,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub dao_config: Account<'info, DaoConfig>,
    pub admin: Signer<'info>,
}

pub fn set_params(
    ctx: Context<SetParams>,
    light_fee_usdc: Option<u64>,
    major_fee_usdc: Option<u64>,
    vote_fee_lamports: Option<u64>,
    min_vote_duration: Option<i64>,
    max_vote_duration: Option<i64>,
    eligibility_flags: Option<u8>,
    weight_params: Option<u64>,
    quorum_threshold: Option<u64>,
    approval_threshold: Option<u64>,
) -> Result<()> {
    let dao_config = &mut ctx.accounts.dao_config;

    if let Some(light_fee) = light_fee_usdc {
        dao_config.light_fee_usdc = light_fee;
    }
    if let Some(major_fee) = major_fee_usdc {
        dao_config.major_fee_usdc = major_fee;
    }
    if let Some(vote_fee) = vote_fee_lamports {
        dao_config.vote_fee_lamports = vote_fee;
    }
    if let Some(min_dur) = min_vote_duration {
        if min_dur < ABSOLUTE_MIN_VOTE_DURATION {
            return Err(ErrorCode::InvalidWindow.into());
        }
        dao_config.min_vote_duration = min_dur;
    }
    if let Some(max_dur) = max_vote_duration {
        dao_config.max_vote_duration = max_dur;
    }
    if let Some(flags) = eligibility_flags {
        dao_config.eligibility_flags = flags;
    }
    if let Some(weight) = weight_params {
        dao_config.weight_params = weight;
    }
    if let Some(quorum) = quorum_threshold {
        if quorum > MAX_QUORUM_THRESHOLD {
            return Err(ErrorCode::InvalidThreshold.into());
        }
        dao_config.quorum_threshold = quorum;
    }
    if let Some(approval) = approval_threshold {
        if approval < 100 || approval > 10000 {
            return Err(ErrorCode::InvalidWindow.into());
        }
        dao_config.approval_threshold = approval;
    }

    // Validate duration windows after updates
    if dao_config.min_vote_duration >= dao_config.max_vote_duration
        || dao_config.min_vote_duration <= 0
    {
        return Err(ErrorCode::InvalidWindow.into());
    }

    emit!(crate::events::ParamsUpdated {
        admin: ctx.accounts.admin.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct SetPause<'info> {
    #[account(
        mut,
        seeds = [b"dao_config"],
        bump = dao_config.bump,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub dao_config: Account<'info, DaoConfig>,
    pub admin: Signer<'info>,
}

pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
    ctx.accounts.dao_config.paused = paused;

    emit!(crate::events::PauseStatusChanged {
        paused,
        admin: ctx.accounts.admin.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct TransferAdmin<'info> {
    #[account(
        mut,
        seeds = [b"dao_config"],
        bump = dao_config.bump,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub dao_config: Account<'info, DaoConfig>,
    pub admin: Signer<'info>,
    /// CHECK: New admin pubkey - will be validated by admin
    pub new_admin: UncheckedAccount<'info>,
}

pub fn transfer_admin(ctx: Context<TransferAdmin>) -> Result<()> {
    let old_admin = ctx.accounts.dao_config.admin;
    let new_admin = ctx.accounts.new_admin.key();
    ctx.accounts.dao_config.admin = new_admin;

    emit!(crate::events::AdminTransferred {
        old_admin,
        new_admin,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
