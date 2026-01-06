// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IDisputeResolution Interface
/// @notice Interface for Dispute contract to be called by Escrow contract
interface IDisputeResolution {
    enum DisputeReason { 
        LATE_DELIVERY,      
        REFUND_REQUEST,     
        QUALITY_ISSUE,      
        OTHER               
    }

    enum DisputeStatus { 
        OPEN,               // Dispute is open for voting
        RESOLVED,           // Dispute resolved, winner determined
        REJECTED,           // Dispute rejected (tie vote)
        PENDING_EXECUTION,  // Resolved, waiting for escrow execution
        EXECUTED            // Escrow has executed the outcome
    }

    /// @notice Get dispute outcome
    /// @param disputeId The dispute ID
    /// @return winner Address that won the dispute
    /// @return reason The reason for the dispute
    /// @return status Current status of dispute
    function getDisputeOutcome(uint256 disputeId) 
        external 
        view 
        returns (
            address winner,
            DisputeReason reason,
            DisputeStatus status
        );

    /// @notice Mark dispute as executed by escrow
    /// @param disputeId The dispute ID
    function markDisputeExecuted(uint256 disputeId) external;
}