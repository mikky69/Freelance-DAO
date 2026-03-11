// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

/// @title  IEscrow
/// @notice Interface that the Dispute contract uses to notify the Escrow contract
///         of dispute creation and resolution events.
interface IEscrow {

    /// @notice Called by the Dispute contract when a new dispute is opened.
    /// @param  jobId      The escrow job under dispute.
    /// @param  disputeId  The ID assigned by the Dispute contract.
    /// @param  reason     Typed reason for the dispute.
    function notifyDisputeCreated(
        uint256 jobId,
        uint256 disputeId,
        DataTypes.DisputeReason reason
    ) external;

    /// @notice Called by the Dispute contract once a dispute is resolved.
    /// @param  jobId      The escrow job that was disputed.
    /// @param  disputeId  The resolved dispute ID.
    /// @param  reason     The dispute reason (determines how escrow reacts).
    /// @param  winner     The winning address (client or freelancer). address(0) on tie.
    function notifyDisputeResolved(
        uint256 jobId,
        uint256 disputeId,
        DataTypes.DisputeReason reason,
        address winner
    ) external;
}
