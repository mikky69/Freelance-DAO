// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  FeeCalculator
/// @notice Pure fee-calculation helpers for the Escrow contract.
/// @dev    All percentages use integer arithmetic — no floating point.
library FeeCalculator {

    uint256 private constant PCT_BASE              = 100;
    uint256 private constant NORMAL_FEE_PCT        = 5;   // 5 %  – standard completion
    uint256 private constant LATE_DELIVERY_FEE_PCT = 7;   // 7 %  – late delivery penalty (5 + 2)
    uint256 private constant EARLY_WITHDRAW_FEE_PCT = 10; // 10 % – early milestone withdrawal

    /// @notice 5 % fee for a normally-completed job.
    function calculateNormalFee(uint256 amount) internal pure returns (uint256) {
        return (amount * NORMAL_FEE_PCT) / PCT_BASE;
    }

    /// @notice 7 % fee when a late-delivery dispute was upheld.
    function calculateLateDeliveryFee(uint256 amount) internal pure returns (uint256) {
        return (amount * LATE_DELIVERY_FEE_PCT) / PCT_BASE;
    }

    /// @notice 10 % fee when a freelancer withdraws milestone earnings early
    ///         (i.e., not all milestones are confirmed yet).
    function calculateEarlyWithdrawalFee(uint256 amount) internal pure returns (uint256) {
        return (amount * EARLY_WITHDRAW_FEE_PCT) / PCT_BASE;
    }

    /// @notice Net amount after deducting `fee` from `amount`.
    /// @dev    Reverts if fee > amount — should never happen with correct callers.
    function calculateNet(uint256 amount, uint256 fee) internal pure returns (uint256) {
        require(amount >= fee, "FeeCalculator: fee exceeds amount");
        return amount - fee;
    }
}
