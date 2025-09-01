// programs/staking/src/instructions/rewards.rs
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, MintTo, Mint};
use crate::{
    state_accounts::{RewardsConfig, StakePosition},
    errors::StakingError,
    events::PointsExchanged,
    math::points_to_fldao,
};

#[derive(Accounts)]
pub struct ExchangePoints<'info> {
    #[account(
        seeds = [b"rewards_config"],
        bump = rewards_config.bump
    )]
    pub rewards_config: Account<'info, RewardsConfig>,
    #[account(
        mut,
        has_one = staker @ StakingError::Unauthorized
    )]
    pub position: Account<'info, StakePosition>,
    #[account(mut)]
    pub fl_dao_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_fl_dao_account: Account<'info, TokenAccount>,
    /// CHECK: This is the mint authority PDA
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    pub staker: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn exchange_points(ctx: Context<ExchangePoints>, points: u128, min_out: u64) -> Result<()> {
    let rewards_config = &ctx.accounts.rewards_config;
    let position = &mut ctx.accounts.position;
    
    if rewards_config.paused {
        return Err(StakingError::Unauthorized.into());
    }
    
    if position.accum_points < points {
        return Err(StakingError::InsufficientPoints.into());
    }
    
    // Calculate FL-DAO tokens to mint
    let fldao_amount = points_to_fldao(points, rewards_config.exchange_rate)?;
    
    if fldao_amount < min_out {
        return Err(StakingError::InvalidAmount.into());
    }
    
    // Burn points from position
    position.accum_points = position.accum_points
        .checked_sub(points)
        .ok_or(StakingError::MathOverflow)?;
    
    // Mint FL-DAO tokens
    let mint_authority_seeds = &[b"mint_authority".as_ref(), &[ctx.bumps.mint_authority]]; // Fixed: direct access
    
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.fl_dao_mint.to_account_info(),
                to: ctx.accounts.user_fl_dao_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            &[mint_authority_seeds],
        ),
        fldao_amount,
    )?;
    
    let clock = Clock::get()?;
    
    emit!(PointsExchanged {
        staker: position.staker,
        points_burned: points,
        fldao_minted: fldao_amount,
        exchange_rate: rewards_config.exchange_rate,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}