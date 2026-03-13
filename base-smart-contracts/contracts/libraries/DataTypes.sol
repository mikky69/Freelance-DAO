// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DataTypes
/// @notice Shared enums used across Escrow, Dispute, Staking and Proposals contracts.
///         Centralised here to avoid enum casting hacks between contracts.
library DataTypes {

    // ─────────────────────────────────────────────────────────
    //  Dispute shared types
    // ─────────────────────────────────────────────────────────

    /// @dev Reason behind a dispute. Both IEscrow and IDisputeResolution use this.
    enum DisputeReason {
        LATE_DELIVERY,    // 0 – freelancer delivered after deadline
        REFUND_REQUEST,   // 1 – client wants money back
        QUALITY_ISSUE,    // 2 – client unhappy with quality
        OTHER             // 3 – catch-all
    }

    /// @dev Life-cycle of a dispute.
    enum DisputeStatus {
        OPEN,      // 0 – awaiting votes or auto-resolution
        RESOLVED,  // 1 – winner determined
        REJECTED,  // 2 – quorum not reached / tie
        EXECUTED   // 3 – escrow has acted on the result
    }

    // ─────────────────────────────────────────────────────────
    //  Proposal shared types
    // ─────────────────────────────────────────────────────────

    /// @dev Two tiers of proposal.
    ///      MINOR – open to anyone with ≥ $1 USD staked.
    ///      MAJOR – requires ≥ $100 USD staked at creation time (Chainlink-priced).
    enum ProposalTier { MINOR, MAJOR }
}
