use crate::{
    constants::ESCROW_SEED,
    errors::EscrowError,
    events::*,
    state::{EscrowAccount, EscrowState},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SubmitSignature<'info> {
    #[account(
        mut,
        seeds = [
            ESCROW_SEED,
            escrow.client.as_ref(),
            escrow.escrow_id.to_le_bytes().as_ref()
        ],
        bump = escrow.bump,
        constraint = escrow.state == EscrowState::AwaitingSigs @ EscrowError::InvalidState
    )]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,
}

pub fn submit_signature(ctx: Context<SubmitSignature>, signature_data: [u8; 64]) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let signer = &ctx.accounts.signer;

    // Validate signature is not all zeros
    require!(signature_data != [0u8; 64], EscrowError::InvalidSignature);

    let is_client = escrow.client == signer.key();
    let is_freelancer = escrow.freelancer == signer.key();

    require!(is_client || is_freelancer, EscrowError::Unauthorized);

    if is_client {
        require!(
            escrow.client_signature.is_none(),
            EscrowError::SignatureAlreadySubmitted
        );
        escrow.client_signature = Some(signature_data);
    } else {
        require!(
            escrow.freelancer_signature.is_none(),
            EscrowError::SignatureAlreadySubmitted
        );
        escrow.freelancer_signature = Some(signature_data);
    }

    emit!(SignatureSubmitted {
        escrow_id: escrow.escrow_id,
        signer: signer.key(),
        is_client,
        timestamp: Clock::get()?.unix_timestamp,
    });

    // Check if both signatures are now present
    if escrow.client_signature.is_some() && escrow.freelancer_signature.is_some() {
        escrow.state = EscrowState::Active;
        escrow.signed_at = Some(Clock::get()?.unix_timestamp);

        emit!(EscrowActivated {
            escrow_id: escrow.escrow_id,
            timestamp: escrow.signed_at.unwrap(),
        });

        msg!("Both signatures received, escrow is now active");
    } else {
        msg!("Signature submitted, waiting for the other party");
    }

    Ok(())
}
