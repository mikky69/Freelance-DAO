// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title FeeCalculator Library
/// @notice Handles all fee calculation logic for the escrow contract
/// @dev Centralized fee logic for cleaner code
library FeeCalculator {
    uint256 public constant PCT_BASE = 100;
    uint256 public constant NORMAL_FEE = 5;           // 5%
    uint256 public constant LATE_DELIVERY_FEE = 7;    // 7% (5% + 2% penalty)
    uint256 public constant EARLY_WITHDRAWAL_FEE = 10; // 10% for early milestone withdrawal

    /// @notice Calculate fee for normal completion
    /// @param amount The amount to calculate fee on
    /// @return fee The calculated fee
    function calculateNormalFee(uint256 amount) internal pure returns (uint256) {
        return (amount * NORMAL_FEE) / PCT_BASE;
    }

    /// @notice Calculate fee for late delivery
    /// @param amount The amount to calculate fee on
    /// @return fee The calculated fee (7%)
    function calculateLateDeliveryFee(uint256 amount) internal pure returns (uint256) {
        return (amount * LATE_DELIVERY_FEE) / PCT_BASE;
    }

    /// @notice Calculate fee for early milestone withdrawal
    /// @param amount The amount to calculate fee on
    /// @return fee The calculated fee (10%)
    function calculateEarlyWithdrawalFee(uint256 amount) internal pure returns (uint256) {
        return (amount * EARLY_WITHDRAWAL_FEE) / PCT_BASE;
    }

    /// @notice Calculate net amount after fee deduction
    /// @param amount Gross amount
    /// @param fee Fee to deduct
    /// @return net Net amount after fee
    function calculateNet(uint256 amount, uint256 fee) internal pure returns (uint256) {
        require(amount >= fee, "Fee exceeds amount");
        return amount - fee;
    }
}