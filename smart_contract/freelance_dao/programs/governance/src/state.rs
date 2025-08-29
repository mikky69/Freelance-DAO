use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Default)]
pub enum ProposalKind {
    #[default]
    Light,
    Major,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Default)]
pub enum ProposalState {
    #[default]
    Draft,
    Active,
    Succeeded,
    Failed,
    Canceled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Default)]
pub enum VoteChoice {
    #[default]
    Yes,
    No,
}