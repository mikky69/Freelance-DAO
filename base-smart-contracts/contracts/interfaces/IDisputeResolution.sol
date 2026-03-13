// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

/// @title  IDisputeResolution
/// @notice Interface the Escrow contract uses to query dispute outcomes.
interface IDisputeResolution {

    /// @notice Returns the outcome of a resolved dispute.
    /// @param  disputeId  The dispute to query.
    /// @return winner     Winning address (client or freelancer). address(0) on tie.
    /// @return reason     The dispute reason.
    /// @return status     Current status of the dispute.
    function getDisputeOutcome(uint256 disputeId)
        external
        view
        returns (
            address winner,
            DataTypes.DisputeReason reason,
            DataTypes.DisputeStatus status
        );

    /// @notice Called by the Escrow contract to mark a resolved dispute as executed.
    /// @dev    Only callable by the registered escrow contract.
    /// @param  disputeId  The dispute to mark executed.
    function markDisputeExecuted(uint256 disputeId) external;
}
