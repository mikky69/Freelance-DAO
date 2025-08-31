use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer as SplTransfer, Mint};
use crate::{state_accounts::DaoConfig, errors::ErrorCode};

#[derive(Accounts)]
pub struct InitTreasury<'info> {
    #[account(
        mut,
        seeds = [b"dao_config"],
        bump = dao_config.bump,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub dao_config: Account<'info, DaoConfig>,
    
    /// CHECK: Treasury PDA for SOL storage - no init needed for SOL treasury
    #[account(
        seeds = [b"treasury", dao_config.key().as_ref()],
        bump
    )]
    pub treasury: UncheckedAccount<'info>,
    
    #[account(
        init,
        payer = admin,
        seeds = [b"usdc_treasury", dao_config.key().as_ref()],
        bump,
        token::mint = usdc_mint,
        token::authority = treasury
    )]
    pub usdc_treasury: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn init_treasury(ctx: Context<InitTreasury>) -> Result<()> {
    let dao_config = &mut ctx.accounts.dao_config;
    
    // Update DAO config with treasury information
    dao_config.treasury = ctx.accounts.treasury.key();
    dao_config.usdc_treasury = ctx.accounts.usdc_treasury.key();
    dao_config.usdc_mint = ctx.accounts.usdc_mint.key();
    
    msg!("Treasury initialized successfully");
    msg!("SOL Treasury: {}", dao_config.treasury);
    msg!("USDC Treasury: {}", dao_config.usdc_treasury);
    msg!("USDC Mint: {}", dao_config.usdc_mint);
    
    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawTreasury<'info> {
    #[account(
        seeds = [b"dao_config"],
        bump = dao_config.bump,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub dao_config: Account<'info, DaoConfig>,
    
    #[account(
        mut,
        seeds = [b"treasury", dao_config.key().as_ref()],
        bump
    )]
    /// CHECK: This is the SOL treasury PDA
    pub treasury: UncheckedAccount<'info>,
    
    #[account(
        mut,
        seeds = [b"usdc_treasury", dao_config.key().as_ref()],
        bump
    )]
    pub usdc_treasury: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub destination_sol: SystemAccount<'info>,
    
    #[account(mut)]
    pub destination_usdc: Account<'info, TokenAccount>,
    
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn withdraw_sol(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
    let dao_config = &ctx.accounts.dao_config;
    let dao_config_key = dao_config.key();
    let treasury_seeds = &[
        b"treasury",
        dao_config_key.as_ref(),
        &[ctx.bumps.treasury]
    ];
    
    anchor_lang::system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.treasury.to_account_info(),
                to: ctx.accounts.destination_sol.to_account_info(),
            },
            &[treasury_seeds]
        ),
        amount,
    )?;
    
    Ok(())
}

pub fn withdraw_usdc(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
    let dao_config = &ctx.accounts.dao_config;
    let dao_config_key = dao_config.key();
    let treasury_seeds = &[
        b"treasury",
        dao_config_key.as_ref(),
        &[ctx.bumps.treasury]
    ];
    
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            SplTransfer {
                from: ctx.accounts.usdc_treasury.to_account_info(),
                to: ctx.accounts.destination_usdc.to_account_info(),
                authority: ctx.accounts.treasury.to_account_info(),
            },
            &[treasury_seeds]
        ),
        amount,
    )?;
    
    Ok(())
}