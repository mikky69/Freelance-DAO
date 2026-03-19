// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/// @title  PriceConverter
/// @notice Chainlink-based ETH/USD conversion helpers.
/// @dev    All Chainlink ETH/USD feeds return prices with 8 decimals.
///         USD amounts in this library also use 8 decimals for precision.
///         Example: $100 USD = 100_00000000 (100 * 1e8).
library PriceConverter {

    /// @dev Staleness threshold: reject price data older than 1 hour.
    uint256 private constant STALE_AFTER = 1 hours;

    // ─── Price Feed Query ────────────────────────────────────────────────────

    /// @notice Fetch the current ETH/USD price from Chainlink (8-decimal precision).
    /// @param  feed  The AggregatorV3Interface of the ETH/USD price feed.
    /// @return price ETH price in USD * 1e8 (e.g., $3 000 → 300_000_000_000).
    function getETHUSDPrice(AggregatorV3Interface feed) internal view returns (uint256 price) {
        (, int256 rawPrice, , uint256 updatedAt, ) = feed.latestRoundData();
        require(rawPrice > 0,                                "PriceConverter: invalid price");
        require(block.timestamp - updatedAt <= STALE_AFTER, "PriceConverter: stale price feed");
        price = uint256(rawPrice);
    }

    // ─── USD ↔ ETH Conversions ───────────────────────────────────────────────

    /// @notice Convert a USD amount (8-decimal) to its equivalent in wei.
    /// @param  usdAmount8dec  USD value with 8 decimals (e.g., $100 → 10_000_000_000).
    /// @param  feed           ETH/USD Chainlink feed.
    /// @return weiAmount      Equivalent value in wei.
    function usdToWei(
        uint256 usdAmount8dec,
        AggregatorV3Interface feed
    ) internal view returns (uint256 weiAmount) {
        uint256 ethPrice = getETHUSDPrice(feed); // 8 decimals
        // wei = (usdAmount8dec * 1e18) / ethPrice
        weiAmount = (usdAmount8dec * 1e18) / ethPrice;
    }

    /// @notice Convert a wei amount to its USD value (8-decimal).
    /// @param  weiAmount      Value in wei.
    /// @param  feed           ETH/USD Chainlink feed.
    /// @return usdAmount8dec  USD value with 8 decimals.
    function weiToUSD(
        uint256 weiAmount,
        AggregatorV3Interface feed
    ) internal view returns (uint256 usdAmount8dec) {
        uint256 ethPrice = getETHUSDPrice(feed); // 8 decimals
        // usd8dec = (weiAmount * ethPrice) / 1e18
        usdAmount8dec = (weiAmount * ethPrice) / 1e18;
    }

    // ─── Threshold Helpers ───────────────────────────────────────────────────

    /// @notice Returns true if `weiAmount` is worth at least `thresholdUSD8dec` USD.
    function meetsUSDThreshold(
        uint256 weiAmount,
        uint256 thresholdUSD8dec,
        AggregatorV3Interface feed
    ) internal view returns (bool) {
        return weiToUSD(weiAmount, feed) >= thresholdUSD8dec;
    }
}