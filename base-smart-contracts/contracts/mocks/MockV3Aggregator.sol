// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  MockV3Aggregator
/// @notice Minimal Chainlink AggregatorV3Interface mock for local testing.
/// @dev    DO NOT deploy to mainnet or any live network.
contract MockV3Aggregator {
    uint8  public decimals;
    int256 public latestAnswer;
    uint256 public latestTimestamp;
    uint256 public latestRound;

    constructor(uint8 _decimals, int256 _initialAnswer) {
        decimals       = _decimals;
        latestAnswer   = _initialAnswer;
        latestTimestamp = block.timestamp;
        latestRound    = 1;
    }

    function updateAnswer(int256 _answer) external {
        latestAnswer    = _answer;
        latestTimestamp = block.timestamp;
        latestRound++;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80  roundId,
            int256  answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80  answeredInRound
        )
    {
        return (
            uint80(latestRound),
            latestAnswer,
            latestTimestamp,
            latestTimestamp,
            uint80(latestRound)
        );
    }

    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80  roundId,
            int256  answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80  answeredInRound
        )
    {
        return (
            _roundId,
            latestAnswer,
            latestTimestamp,
            latestTimestamp,
            _roundId
        );
    }
}
