use crate::{
    constants::{ESCROW_SEED, MIN_ESCROW_AMOUNT},
    errors::EscrowError,
    events::*,
    state::{Counter, EscrowAccount, EscrowState},
};
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
#[instruction(escrow_id: u64)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = client,
        space = EscrowAccount::SIZE,
        seeds = [
            ESCROW_SEED,
            client.key().as_ref(),
            escrow_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(
        mut,
        seeds = [b"counter"],
        bump = counter.bump
    )]
    pub counter: Account<'info, Counter>,

    #[account(mut)]
    pub client: Signer<'info>,

    /// CHECK: Validated as valid pubkey in instruction logic
    pub freelancer: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptProposal<'info> {
    #[account(
        mut,
        seeds = [
            ESCROW_SEED,
            escrow.client.as_ref(),
            escrow.escrow_id.to_le_bytes().as_ref()
        ],
        bump = escrow.bump,
        constraint = escrow.state == EscrowState::Proposed @ EscrowError::InvalidState,
        constraint = escrow.freelancer == freelancer.key() @ EscrowError::InvalidFreelancer
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub freelancer: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteEscrow<'info> {
    #[account(
        mut,
        seeds = [
            ESCROW_SEED,
            escrow.client.as_ref(),
            escrow.escrow_id.to_le_bytes().as_ref()
        ],
        bump = escrow.bump,
        constraint = escrow.state == EscrowState::Active @ EscrowError::InvalidState,
        constraint = escrow.client == client.key() @ EscrowError::Unauthorized,
        close = client
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        mut,
        constraint = freelancer.key() == escrow.freelancer @ EscrowError::InvalidFreelancer
    )]
    /// CHECK: Validated in constraint above
    pub freelancer: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(
        mut,
        seeds = [
            ESCROW_SEED,
            escrow.client.as_ref(),
            escrow.escrow_id.to_le_bytes().as_ref()
        ],
        bump = escrow.bump,
        constraint = can_cancel(&escrow, &authority.key()) @ EscrowError::CannotCancel,
        close = client
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = client.key() == escrow.client @ EscrowError::Unauthorized
    )]
    /// CHECK: Validated in constraint above
    pub client: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_proposal(ctx: Context<CreateProposal>, escrow_id: u64, amount: u64) -> Result<()> {
    require!(amount >= MIN_ESCROW_AMOUNT, EscrowError::AmountTooSmall);

    let escrow = &mut ctx.accounts.escrow;
    let counter = &mut ctx.accounts.counter;
    let client = &ctx.accounts.client;
    let freelancer = &ctx.accounts.freelancer;

    // Validate freelancer is a valid pubkey (not system program, etc.)
    require!(
        freelancer.key() != System::id() && freelancer.key() != Pubkey::default(),
        EscrowError::InvalidFreelancer
    );

    // Transfer SOL to escrow PDA
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: client.to_account_info(),
            to: escrow.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount)?;

    // Initialize escrow account
    escrow.escrow_id = escrow_id;
    escrow.client = client.key();
    escrow.freelancer = freelancer.key();
    escrow.amount = amount;
    escrow.state = EscrowState::Proposed;
    escrow.client_signature = None;
    escrow.freelancer_signature = None;
    escrow.created_at = Clock::get()?.unix_timestamp;
    escrow.signed_at = None;
    escrow.completed_at = None;
    escrow.bump = ctx.bumps.escrow;

    // Update counter
    counter.count += 1;

    emit!(EscrowCreated {
        escrow_id,
        client: client.key(),
        freelancer: freelancer.key(),
        amount,
        timestamp: escrow.created_at,
    });

    msg!("Escrow proposal created with ID: {}", escrow_id);
    Ok(())
}

pub fn accept_proposal(ctx: Context<AcceptProposal>) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let freelancer = &ctx.accounts.freelancer;

    // Change state to AwaitingSigs (signatures required before Active)
    escrow.state = EscrowState::AwaitingSigs;

    emit!(ProposalAccepted {
        escrow_id: escrow.escrow_id,
        freelancer: freelancer.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Proposal accepted, awaiting signatures");
    Ok(())
}

pub fn complete_escrow(ctx: Context<CompleteEscrow>) -> Result<()> {
    let escrow = &ctx.accounts.escrow;
    let clock = Clock::get()?;

    // Store values we need
    let escrow_amount = escrow.amount;
    let escrow_id = escrow.escrow_id;
    let rent_lamports = Rent::get()?.minimum_balance(EscrowAccount::SIZE);

    // CRITICAL FIX: Ensure we don't transfer rent-exempt lamports
    let transferable_amount = escrow_amount;
    let escrow_balance = ctx.accounts.escrow.to_account_info().lamports();

    require!(
        escrow_balance >= rent_lamports + transferable_amount,
        EscrowError::InsufficientFunds
    );

    // Update state BEFORE transfer (prevent reentrancy)
    let escrow_mut = &mut ctx.accounts.escrow;
    escrow_mut.state = EscrowState::Completed;
    escrow_mut.completed_at = Some(clock.unix_timestamp);

    // Transfer funds to freelancer (excluding rent)
    **ctx
        .accounts
        .escrow
        .to_account_info()
        .try_borrow_mut_lamports()? -= transferable_amount;
    **ctx.accounts.freelancer.try_borrow_mut_lamports()? += transferable_amount;

    emit!(EscrowCompleted {
        escrow_id,
        amount: transferable_amount,
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Escrow completed, {} lamports released to freelancer",
        transferable_amount
    );
    Ok(())
}

pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
    let escrow = &ctx.accounts.escrow;
    let clock = Clock::get()?;

    // Store values we need
    let escrow_amount = escrow.amount;
    let escrow_id = escrow.escrow_id;
    let rent_lamports = Rent::get()?.minimum_balance(EscrowAccount::SIZE);

    // CRITICAL FIX: Ensure we don't transfer rent-exempt lamports
    let transferable_amount = escrow_amount;
    let escrow_balance = ctx.accounts.escrow.to_account_info().lamports();

    require!(
        escrow_balance >= rent_lamports + transferable_amount,
        EscrowError::InsufficientFunds
    );

    // Update state BEFORE transfer (prevent reentrancy)
    let escrow_mut = &mut ctx.accounts.escrow;
    escrow_mut.state = EscrowState::Cancelled;

    // Transfer funds back to client (excluding rent)
    **ctx
        .accounts
        .escrow
        .to_account_info()
        .try_borrow_mut_lamports()? -= transferable_amount;
    **ctx.accounts.client.try_borrow_mut_lamports()? += transferable_amount;

    emit!(EscrowCancelled {
        escrow_id,
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Escrow cancelled, {} lamports returned to client",
        transferable_amount
    );
    Ok(())
}

// Helper function to determine if escrow can be cancelled
fn can_cancel(escrow: &EscrowAccount, authority: &Pubkey) -> bool {
    match escrow.state {
        EscrowState::Proposed | EscrowState::AwaitingSigs => {
            // Only client can cancel before Active
            escrow.client == *authority
        }
        EscrowState::Active => {
            // Both parties can cancel when Active
            escrow.client == *authority || escrow.freelancer == *authority
        }
        _ => false, // Cannot cancel if already completed or cancelled
    }
}
