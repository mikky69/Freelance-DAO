use crate::{
    errors::StakingError,
    events::PointsExchanged,
    math::points_to_fldao,
    state_accounts::{RewardsConfig, StakePosition},
};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

#[derive(Accounts)]
pub struct ExchangePoints<'info> {
    #[account(
        mut,
        seeds = [b"rewards_config"],
        bump = rewards_config.bump
    )]
    pub rewards_config: Account<'info, RewardsConfig>,
    #[account(
        mut,
        has_one = staker @ StakingError::Unauthorized
    )]
    pub position: Account<'info, StakePosition>,
    #[account(
        mut,
        constraint = fl_dao_mint.key() == rewards_config.fl_dao_mint @ StakingError::InvalidMint
    )]
    pub fl_dao_mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = user_fl_dao_account.owner == staker.key() @ StakingError::Unauthorized,
        constraint = user_fl_dao_account.mint == rewards_config.fl_dao_mint @ StakingError::InvalidMint
    )]
    pub user_fl_dao_account: Account<'info, TokenAccount>,
    /// CHECK: Validated via seeds and constraint
    #[account(
        seeds = [b"mint_authority"],
        bump,
        constraint = mint_authority.key() == rewards_config.mint_authority @ StakingError::Unauthorized
    )]
    pub mint_authority: UncheckedAccount<'info>,
    pub staker: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn exchange_points(ctx: Context<ExchangePoints>, points: u128, min_out: u64) -> Result<()> {
    // CHECKS
    let rewards_config = &mut ctx.accounts.rewards_config;
    let position = &mut ctx.accounts.position;

    require!(!rewards_config.paused, StakingError::Unauthorized);
    require!(
        position.accum_points >= points,
        StakingError::InsufficientPoints
    );

    let fldao_amount = points_to_fldao(points, rewards_config.exchange_rate)?;
    require!(fldao_amount >= min_out, StakingError::InvalidAmount);

    // EFFECTS (update state BEFORE external calls)
    position.accum_points = position
        .accum_points
        .checked_sub(points)
        .ok_or(StakingError::MathOverflow)?;

    rewards_config.global_fldao_minted = rewards_config
        .global_fldao_minted
        .checked_add(fldao_amount)
        .ok_or(StakingError::MathOverflow)?;

    // INTERACTIONS (external calls last)
    let mint_authority_bump = ctx.bumps.mint_authority;
    let mint_authority_seeds = &[b"mint_authority".as_ref(), &[mint_authority_bump]];

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
