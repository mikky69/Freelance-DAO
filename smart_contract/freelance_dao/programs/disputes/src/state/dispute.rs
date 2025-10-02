use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum DisputeState {
    Pending,
    PanelFormed,
    Deliberating,
    Judged,
    Executed,
    Canceled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum JudgmentChoice {
    Client,
    Freelancer,
    Split(u16), // Percentage (0-100) for client
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Judgment {
    pub choice: JudgmentChoice,
    pub finalized_at: i64,
}

#[account]
pub struct Dispute {
    pub id: u64,
    pub opened_by: Pubkey,
    pub parties: Vec<Pubkey>, // client, freelancer, optional agent
    pub uri: String,          // IPFS/Arweave link to evidence
    pub state: DisputeState,
    pub created_at: i64,
    pub panel_size: u16,
    pub required_quorum: u16,
    pub judgment: Option<Judgment>,
    pub linked_escrow: Option<Pubkey>,
    pub bump: u8,
}

impl Dispute {
    pub const MAX_URI_LENGTH: usize = 200;
    pub const MAX_PARTIES: usize = 3;
    
    pub fn space() -> usize {
        8 +  // discriminator
        8 +  // id
        32 + // opened_by
        4 + (32 * Self::MAX_PARTIES) + // parties (vec + items)
        4 + Self::MAX_URI_LENGTH + // uri (string length + content)
        1 + 7 + // state (enum + padding to 8 bytes)
        8 +  // created_at
        2 +  // panel_size
        2 +  // required_quorum
        1 + (1 + 2 + 8) + // judgment (option + enum discriminant + u16 + timestamp)
        1 + 32 + // linked_escrow (option + pubkey)
        1 +  // bump
        64   // extra padding for safety
    }
}
