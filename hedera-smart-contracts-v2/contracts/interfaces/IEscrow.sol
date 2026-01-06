// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IEscrow Interface
/// @notice Interface for Escrow contract to be called by Dispute contract
interface IEscrow {
    enum DisputeReason { 
        LATE_DELIVERY,      // Late delivery - triggers 7% fee
        REFUND_REQUEST,     // Client wants refund
        QUALITY_ISSUE,      // Quality dispute - DAO decides
        OTHER               // Other disputes
    }

    /// @notice Notify escrow that a dispute has been resolved
    /// @param jobId The job ID in escrow
    /// @param disputeId The dispute ID from dispute contract
    /// @param reason The reason for the dispute
    /// @param winner The address that won the dispute (client or freelancer)
    function notifyDisputeResolved(
        uint256 jobId,
        uint256 disputeId,
        DisputeReason reason,
        address winner
    ) external;

    /// @notice Notify escrow that a dispute has been created
    /// @param jobId The job ID in escrow
    /// @param disputeId The dispute ID from dispute contract
    /// @param reason The reason for the dispute
    function notifyDisputeCreated(
        uint256 jobId,
        uint256 disputeId,
        DisputeReason reason
    ) external;
}