// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  IStaking
/// @notice Interface the Proposals contract uses to query staking data.
interface IStaking {

    /// @notice Returns the raw staked ETH amount (wei) for a user.
    function getStakedAmount(address user) external view returns (uint256 amount);

    /// @notice Returns the staked amount's USD value with 8 decimal precision.
    ///         Uses the live Chainlink ETH/USD feed.
    function getStakedUSDValue(address user) external view returns (uint256 usdValue8dec);

    /// @notice Returns timestamp of last stake action for a user.
    function getStakeTimestamp(address user) external view returns (uint256 timestamp);
}
