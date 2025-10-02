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
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        mut,
        constraint = freelancer.key() == escrow.freelancer @ EscrowError::InvalidFreelancer
    )]
    /// CHECK: Validated in constraint above
    pub freelancer: SystemAccount<'info>,

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
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = client.key() == escrow.client @ EscrowError::Unauthorized
    )]
    /// CHECK: Validated in constraint above
    pub client: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_proposal(ctx: Context<CreateProposal>, escrow_id: u64, amount: u64) -> Result<()> {
    require!(amount >= MIN_ESCROW_AMOUNT, EscrowError::AmountTooSmall);

    let escrow = &mut ctx.accounts.escrow;
    let counter = &mut ctx.accounts.counter;
    let client = &ctx.accounts.client;
    let freelancer = &ctx.accounts.freelancer;

    // Validate freelancer is a valid pubkey
    require!(
        freelancer.key() != System::id()
            && freelancer.key() != Pubkey::default()
            && freelancer.key() != client.key(),
        EscrowError::InvalidFreelancer
    );

    // Calculate rent exemption
    let rent = Rent::get()?;
    let rent_exempt_balance = rent.minimum_balance(EscrowAccount::SIZE);

    // Verify we have enough for rent + escrow (not enforced, just logged for safety)
    let _total_required = amount
        .checked_add(rent_exempt_balance)
        .ok_or(EscrowError::ArithmeticOverflow)?;

    msg!(
        "Rent exemption requirement: {} lamports",
        rent_exempt_balance
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

    let clock = Clock::get()?;

    // Initialize escrow account
    escrow.escrow_id = escrow_id;
    escrow.client = client.key();
    escrow.freelancer = freelancer.key();
    escrow.amount = amount;
    escrow.state = EscrowState::Proposed;
    escrow.client_signature = None;
    escrow.freelancer_signature = None;
    escrow.created_at = clock.unix_timestamp;
    escrow.signed_at = None;
    escrow.completed_at = None;
    escrow.bump = ctx.bumps.escrow;

    // Update counter with checked arithmetic
    counter.increment()?;

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
    let clock = Clock::get()?;

    // Store immutable values first (before any mutable borrows)
    let escrow_id = ctx.accounts.escrow.escrow_id;
    let escrow_amount = ctx.accounts.escrow.amount;
    let escrow_bump = ctx.accounts.escrow.bump;
    let escrow_client = ctx.accounts.escrow.client;

    require!(escrow_amount > 0, EscrowError::InsufficientFunds);

    // Calculate rent to retain
    let rent = Rent::get()?;
    let rent_exempt_balance = rent.minimum_balance(EscrowAccount::SIZE);
    let escrow_lamports = ctx.accounts.escrow.to_account_info().lamports();

    // Ensure we keep rent exemption
    let transferable = escrow_lamports
        .checked_sub(rent_exempt_balance)
        .ok_or(EscrowError::InsufficientFunds)?;

    require!(transferable > 0, EscrowError::InsufficientFunds);

    // Now get mutable reference and update state BEFORE transfer (CEI pattern)
    let escrow = &mut ctx.accounts.escrow;
    escrow.state = EscrowState::Completed;
    escrow.completed_at = Some(clock.unix_timestamp);
    escrow.amount = 0; // Mark as withdrawn

    // Transfer using direct lamport manipulation
    let escrow_info = ctx.accounts.escrow.to_account_info();
    let freelancer_info = ctx.accounts.freelancer.to_account_info();

    **escrow_info.try_borrow_mut_lamports()? = escrow_info
        .lamports()
        .checked_sub(transferable)
        .ok_or(EscrowError::InsufficientFunds)?;

    **freelancer_info.try_borrow_mut_lamports()? = freelancer_info
        .lamports()
        .checked_add(transferable)
        .ok_or(EscrowError::InsufficientFunds)?;

    emit!(EscrowCompleted {
        escrow_id,
        amount: transferable,
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Escrow {} completed, {} lamports released",
        escrow_id,
        transferable
    );
    Ok(())
}

pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
    let clock = Clock::get()?;
    let authority = &ctx.accounts.authority;

    // Store immutable values first (before any mutable borrows)
    let escrow_id = ctx.accounts.escrow.escrow_id;
    let escrow_amount = ctx.accounts.escrow.amount;
    let escrow_bump = ctx.accounts.escrow.bump;
    let escrow_client = ctx.accounts.escrow.client;

    // Validate authority
    require!(
        can_cancel(&ctx.accounts.escrow, &authority.key()),
        EscrowError::CannotCancel
    );

    require!(escrow_amount > 0, EscrowError::InsufficientFunds);

    // Calculate rent to retain
    let rent = Rent::get()?;
    let rent_exempt_balance = rent.minimum_balance(EscrowAccount::SIZE);
    let escrow_lamports = ctx.accounts.escrow.to_account_info().lamports();

    let transferable = escrow_lamports
        .checked_sub(rent_exempt_balance)
        .ok_or(EscrowError::InsufficientFunds)?;

    require!(transferable > 0, EscrowError::InsufficientFunds);

    // Now get mutable reference and update state BEFORE transfer (CEI pattern)
    let escrow = &mut ctx.accounts.escrow;
    escrow.state = EscrowState::Cancelled;
    escrow.amount = 0; // Mark as withdrawn

    // Transfer back to client
    let escrow_info = ctx.accounts.escrow.to_account_info();
    let client_info = ctx.accounts.client.to_account_info();

    **escrow_info.try_borrow_mut_lamports()? = escrow_info
        .lamports()
        .checked_sub(transferable)
        .ok_or(EscrowError::InsufficientFunds)?;

    **client_info.try_borrow_mut_lamports()? = client_info
        .lamports()
        .checked_add(transferable)
        .ok_or(EscrowError::InsufficientFunds)?;

    emit!(EscrowCancelled {
        escrow_id,
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Escrow {} cancelled, {} lamports returned",
        escrow_id,
        transferable
    );
    Ok(())
}

fn can_cancel(escrow: &EscrowAccount, authority: &Pubkey) -> bool {
    match escrow.state {
        EscrowState::Proposed | EscrowState::AwaitingSigs => escrow.client == *authority,
        EscrowState::Active => escrow.client == *authority || escrow.freelancer == *authority,
        _ => false,
    }
}
