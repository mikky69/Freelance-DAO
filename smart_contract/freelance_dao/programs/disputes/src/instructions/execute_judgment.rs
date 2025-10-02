use crate::error::DisputeError;
use crate::events::DisputeExecuted;
use crate::state::{AdminConfig, Dispute, DisputeState};
use anchor_lang::prelude::*;

// ADD THESE IMPORTS
use anchor_lang::solana_program::program::invoke_signed;

#[derive(Accounts)]
pub struct ExecuteJudgment<'info> {
    #[account(mut)]
    pub executor: Signer<'info>,

    #[account(
        seeds = [b"admin_config"],
        bump = admin_config.bump,
        constraint = admin_config.authority == executor.key() @ DisputeError::Unauthorized
    )]
    pub admin_config: Account<'info, AdminConfig>,

    #[account(
        mut,
        constraint = dispute.state == DisputeState::Judged @ DisputeError::InvalidDisputeState,
        constraint = dispute.judgment.is_some() @ DisputeError::InvalidDisputeState
    )]
    pub dispute: Account<'info, Dispute>,

    // CHANGE FROM Option TO REQUIRED WHEN ESCROW EXISTS
    /// CHECK: The escrow program - validated by the dispute's linked_escrow field
    #[account(
        constraint = escrow_program.key() == crate::ESCROW_PROGRAM_ID @ DisputeError::InvalidEscrowAccount
    )]
    pub escrow_program: UncheckedAccount<'info>,

    /// CHECK: The escrow account - validated by CPI call
    #[account(
        mut,
        constraint = escrow_account.owner == &escrow_program.key() @ DisputeError::InvalidEscrowAccount,
    )]
    pub escrow_account: UncheckedAccount<'info>,

    // ADD THESE ACCOUNTS FOR ESCROW CPI
    /// CHECK: Client account to receive funds
    #[account(mut)]
    pub client: UncheckedAccount<'info>,

    /// CHECK: Freelancer account to receive funds
    #[account(mut)]
    pub freelancer: UncheckedAccount<'info>,

    /// CHECK: Vault holding the escrowed funds
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    // ADD IF YOUR ESCROW USES SPL TOKENS
    // pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ExecuteJudgment>) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute;
    let clock = Clock::get()?;

    // REENTRANCY GUARD: Change state BEFORE any CPI calls
    let judgment_choice = dispute.judgment.as_ref().unwrap().choice.clone();
    let linked_escrow = dispute.linked_escrow;

    dispute.state = DisputeState::Executed;

    // REPLACE THE TODO WITH ACTUAL CPI
    if let Some(escrow_key) = linked_escrow {
        // Validate the escrow account matches
        require!(
            ctx.accounts.escrow_account.key() == escrow_key,
            DisputeError::InvalidEscrowAccount
        );

        msg!("Executing judgment for escrow: {}", escrow_key);

        // Create the dispute PDA seeds for signing
        let dispute_seeds = &[b"dispute", &dispute.id.to_le_bytes()[..], &[dispute.bump]];
        let signer_seeds = &[&dispute_seeds[..]];

        // Build the CPI instruction based on your escrow program's interface
        // ADJUST THIS BASED ON YOUR ACTUAL ESCROW PROGRAM INSTRUCTIONS
        match judgment_choice {
            crate::state::JudgmentChoice::Client => {
                // Release 100% to client
                let ix = anchor_lang::solana_program::instruction::Instruction {
                    program_id: ctx.accounts.escrow_program.key(),
                    accounts: vec![
                        AccountMeta::new(ctx.accounts.escrow_account.key(), false),
                        AccountMeta::new(ctx.accounts.client.key(), false),
                        AccountMeta::new(ctx.accounts.vault.key(), false),
                        AccountMeta::new_readonly(dispute.key(), true), // Dispute as authority
                        AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                    ],
                    data: vec![0], // Your escrow instruction discriminator for "release_to_client"
                };

                invoke_signed(
                    &ix,
                    &[
                        ctx.accounts.escrow_account.to_account_info(),
                        ctx.accounts.client.to_account_info(),
                        ctx.accounts.vault.to_account_info(),
                        dispute.to_account_info(),
                        ctx.accounts.system_program.to_account_info(),
                    ],
                    signer_seeds,
                )?;
            }
            crate::state::JudgmentChoice::Freelancer => {
                // Release 100% to freelancer
                let ix = anchor_lang::solana_program::instruction::Instruction {
                    program_id: ctx.accounts.escrow_program.key(),
                    accounts: vec![
                        AccountMeta::new(ctx.accounts.escrow_account.key(), false),
                        AccountMeta::new(ctx.accounts.freelancer.key(), false),
                        AccountMeta::new(ctx.accounts.vault.key(), false),
                        AccountMeta::new_readonly(dispute.key(), true),
                        AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                    ],
                    data: vec![1], // Your escrow instruction discriminator for "release_to_freelancer"
                };

                invoke_signed(
                    &ix,
                    &[
                        ctx.accounts.escrow_account.to_account_info(),
                        ctx.accounts.freelancer.to_account_info(),
                        ctx.accounts.vault.to_account_info(),
                        dispute.to_account_info(),
                        ctx.accounts.system_program.to_account_info(),
                    ],
                    signer_seeds,
                )?;
            }
            crate::state::JudgmentChoice::Split(percentage) => {
                // Split based on percentage
                require!(percentage <= 100, DisputeError::InvalidJudgmentChoice);

                // Encode percentage as instruction data
                let mut data = vec![2]; // Discriminator for "split_release"
                data.extend_from_slice(&percentage.to_le_bytes());

                let ix = anchor_lang::solana_program::instruction::Instruction {
                    program_id: ctx.accounts.escrow_program.key(),
                    accounts: vec![
                        AccountMeta::new(ctx.accounts.escrow_account.key(), false),
                        AccountMeta::new(ctx.accounts.client.key(), false),
                        AccountMeta::new(ctx.accounts.freelancer.key(), false),
                        AccountMeta::new(ctx.accounts.vault.key(), false),
                        AccountMeta::new_readonly(dispute.key(), true),
                        AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                    ],
                    data,
                };

                invoke_signed(
                    &ix,
                    &[
                        ctx.accounts.escrow_account.to_account_info(),
                        ctx.accounts.client.to_account_info(),
                        ctx.accounts.freelancer.to_account_info(),
                        ctx.accounts.vault.to_account_info(),
                        dispute.to_account_info(),
                        ctx.accounts.system_program.to_account_info(),
                    ],
                    signer_seeds,
                )?;
            }
        }
    }

    emit!(DisputeExecuted {
        dispute_id: dispute.id,
        judgment: judgment_choice,
        linked_escrow,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
