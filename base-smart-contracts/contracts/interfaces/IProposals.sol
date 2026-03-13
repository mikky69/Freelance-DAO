// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  IProposals
/// @notice Interface the Staking contract uses to notify Proposals of stake changes.
///         This enables the bidirectional Staking ↔ Proposals communication channel.
interface IProposals {

    /// @notice Called by the Staking contract whenever a user's staked balance changes.
    ///         Allows the Proposals contract to react to stake increases / decreases
    ///         (e.g., emit events for off-chain monitoring, or enforce tier constraints).
    /// @param  user            The user whose stake changed.
    /// @param  newStakedWei    The user's new staked balance in wei after the change.
    function onStakeChanged(address user, uint256 newStakedWei) external;
}
