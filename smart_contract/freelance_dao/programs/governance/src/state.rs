// UPDATED state.rs
// ============================================
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Default)]
pub enum ProposalKind {
    #[default]
    Light,    // Small changes, lower fee
    Major,    // Significant changes, higher fee
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Default)]
pub enum ProposalState {
    #[default]
    Draft,     // Not yet active
    Active,    // Currently accepting votes
    Succeeded, // Passed voting requirements
    Failed,    // Did not meet requirements
    Canceled,  // Canceled by creator
    Executed,  // Successfully executed (for tracking)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Default)]
pub enum VoteChoice {
    #[default]
    Yes,
    No,
}

// New: Proposal categories for better organization
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum ProposalCategory {
    Treasury,     // Treasury management proposals
    Parameters,   // DAO parameter changes
    Membership,   // Membership rule changes
    General,      // General governance proposals
}

impl Default for ProposalCategory {
    fn default() -> Self {
        ProposalCategory::General
    }
}

// ============================================
// CLIENT HELPER FUNCTIONS (TypeScript/JavaScript)
// ============================================

/*
// Helper functions for the frontend (put these in a separate TS file)

export interface CreateProposalParams {
  kind: 'Light' | 'Major';
  title: string;
  description: string;
  uri: string; // IPFS or Arweave link to full proposal
  votingWindow: number; // seconds
}

export function hashTitle(title: string): Uint8Array {
  // Use a consistent hashing method (e.g., SHA-256)
  return new TextEncoder().encode(title).slice(0, 32);
}

export async function createProposal(
  program: Program,
  wallet: Wallet,
  params: CreateProposalParams
): Promise<string> {
  const titleHash = hashTitle(params.title);
  
  // Get DAO config
  const [daoConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("dao_config")],
    program.programId
  );
  
  // Get proposal PDA
  const daoConfigData = await program.account.daoConfig.fetch(daoConfig);
  const [proposal] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("proposal"),
      daoConfig.toBuffer(),
      Buffer.from(daoConfigData.proposalCount.toString())
    ],
    program.programId
  );
  
  const tx = await program.methods
    .createProposal(
      { [params.kind.toLowerCase()]: {} },
      params.uri,
      Array.from(titleHash),
      new BN(params.votingWindow)
    )
    .accounts({
      daoConfig,
      proposal,
      creator: wallet.publicKey,
      // ... other accounts
    })
    .rpc();
    
  return tx;
}

export async function castVote(
  program: Program,
  wallet: Wallet,
  proposalId: PublicKey,
  choice: 'Yes' | 'No'
): Promise<string> {
  const [daoConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("dao_config")],
    program.programId
  );
  
  const [voteRecord] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("vote"),
      proposalId.toBuffer(),
      wallet.publicKey.toBuffer()
    ],
    program.programId
  );
  
  const tx = await program.methods
    .castVote({ [choice.toLowerCase()]: {} })
    .accounts({
      daoConfig,
      proposal: proposalId,
      voteRecord,
      voter: wallet.publicKey,
      // ... other accounts
    })
    .rpc();
    
  return tx;
}
*/