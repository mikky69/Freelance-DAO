use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::{
    state::{EscrowAccount, EscrowState, Counter},
    constants::{ESCROW_SEED, MIN_ESCROW_AMOUNT},
    errors::EscrowError,
    events::*,
};

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
    
    /// CHECK: This is the freelancer's public key
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
        bump = escrow.bump
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
        bump = escrow.bump
    )]
    pub escrow: Account<'info, EscrowAccount>,
    
    #[account(mut)]
    pub client: Signer<'info>,
    
    #[account(mut)]
    /// CHECK: This is the freelancer receiving the payment
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
        bump = escrow.bump
    )]
    pub escrow: Account<'info, EscrowAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    /// CHECK: This is the client receiving the refund
    pub client: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    escrow_id: u64,
    amount: u64,
) -> Result<()> {
    require!(amount >= MIN_ESCROW_AMOUNT, EscrowError::AmountTooSmall);
    
    let escrow = &mut ctx.accounts.escrow;
    let counter = &mut ctx.accounts.counter;
    let client = &ctx.accounts.client;
    let freelancer = &ctx.accounts.freelancer;
    
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
    
    require!(
        escrow.freelancer == freelancer.key(),
        EscrowError::InvalidFreelancer
    );
    require!(
        escrow.state == EscrowState::Proposed,
        EscrowError::InvalidState
    );
    
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
    let escrow = &mut ctx.accounts.escrow;
    let client = &ctx.accounts.client;
    let freelancer = &ctx.accounts.freelancer;
    
    require!(
        escrow.client == client.key(),
        EscrowError::Unauthorized
    );
    require!(
        escrow.state == EscrowState::Active,
        EscrowError::InvalidState
    );
    
    // Transfer funds to freelancer - fix for temporary value issue
    let escrow_id_bytes = escrow.escrow_id.to_le_bytes();
    let escrow_seeds = &[
        ESCROW_SEED,
        escrow.client.as_ref(),
        escrow_id_bytes.as_ref(),
        &[escrow.bump],
    ];
    let signer_seeds = &[&escrow_seeds[..]];
    
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: escrow.to_account_info(),
            to: freelancer.to_account_info(),
        },
        signer_seeds,
    );
    system_program::transfer(cpi_context, escrow.amount)?;
    
    escrow.state = EscrowState::Completed;
    escrow.completed_at = Some(Clock::get()?.unix_timestamp);
    
    emit!(EscrowCompleted {
        escrow_id: escrow.escrow_id,
        amount: escrow.amount,
        timestamp: escrow.completed_at.unwrap(),
    });
    
    msg!("Escrow completed, funds released to freelancer");
    Ok(())
}

pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let authority = &ctx.accounts.authority;
    let client = &ctx.accounts.client;
    
    // Only client can cancel before Active, both parties can cancel after
    let can_cancel = match escrow.state {
        EscrowState::Proposed | EscrowState::AwaitingSigs => {
            escrow.client == authority.key()
        }
        EscrowState::Active => {
            escrow.client == authority.key() || escrow.freelancer == authority.key()
        }
        _ => false,
    };
    
    require!(can_cancel, EscrowError::Unauthorized);
    
    // Refund to client - fix for temporary value issue
    let escrow_id_bytes = escrow.escrow_id.to_le_bytes();
    let escrow_seeds = &[
        ESCROW_SEED,
        escrow.client.as_ref(),
        escrow_id_bytes.as_ref(),
        &[escrow.bump],
    ];
    let signer_seeds = &[&escrow_seeds[..]];
    
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: escrow.to_account_info(),
            to: client.to_account_info(),
        },
        signer_seeds,
    );
    system_program::transfer(cpi_context, escrow.amount)?;
    
    escrow.state = EscrowState::Cancelled;
    
    emit!(EscrowCancelled {
        escrow_id: escrow.escrow_id,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    msg!("Escrow cancelled, funds returned to client");
    Ok(())
}