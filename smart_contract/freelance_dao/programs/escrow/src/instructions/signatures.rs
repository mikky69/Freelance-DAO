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
    let clock = Clock::get()?;

    // Enhanced signature validation
    require!(signature_data != [0u8; 64], EscrowError::InvalidSignature);

    // Check signature entropy (must have at least 32 non-zero bytes)
    let non_zero_bytes = signature_data.iter().filter(|&&b| b != 0).count();
    require!(non_zero_bytes >= 32, EscrowError::InvalidSignature);

    // Check for basic entropy - count unique byte values
    let mut byte_counts = [0u8; 256];
    for &byte in signature_data.iter() {
        byte_counts[byte as usize] = byte_counts[byte as usize].saturating_add(1);
    }
    let unique_bytes = byte_counts.iter().filter(|&&count| count > 0).count();
    require!(unique_bytes >= 8, EscrowError::InvalidSignature);

    let is_client = escrow.client == signer.key();
    let is_freelancer = escrow.freelancer == signer.key();

    require!(is_client || is_freelancer, EscrowError::Unauthorized);

    // Check and submit signature
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
        timestamp: clock.unix_timestamp,
    });

    // Check if both signatures are now present
    if escrow.client_signature.is_some() && escrow.freelancer_signature.is_some() {
        escrow.state = EscrowState::Active;
        escrow.signed_at = Some(clock.unix_timestamp);

        emit!(EscrowActivated {
            escrow_id: escrow.escrow_id,
            timestamp: escrow.signed_at.unwrap(),
        });

        msg!(
            "Both signatures received, escrow {} is now active",
            escrow.escrow_id
        );
    } else {
        msg!(
            "Signature submitted for escrow {}, waiting for the other party",
            escrow.escrow_id
        );
    }

    Ok(())
}
