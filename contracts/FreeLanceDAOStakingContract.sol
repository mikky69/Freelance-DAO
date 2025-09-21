// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; 

/**
 * @title FreeLanceDAOStaking
 * @dev Simplified HBAR staking contract, native Hedera
 */
contract FreeLanceDAOStaking is Ownable {

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewards;
    }

    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    uint256 public rewardRate; // daily reward in % * 100 (e.g., 5 = 5%)
    uint256 public lockTime;   // in seconds
    uint256 public minimumFunding; // contract must keep this reserve

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event LockTimeUpdated(uint256 newLockTime);
    event MinimumFundingUpdated(uint256 newMinimum);

    constructor(uint256 _rewardRate, uint256 _lockTime, uint256 _minimumFunding) {
        require(_rewardRate > 0 && _rewardRate <= 10, "Reward rate 1-10%");
        rewardRate = _rewardRate;
        lockTime = _lockTime;
        minimumFunding = _minimumFunding;
    }

    // ----------- Core Functions -----------

    function stake() external payable {
        require(msg.value > 0, "Stake must be > 0");

        Stake storage user = stakes[msg.sender];

        // Update rewards
        if(user.amount > 0){
            uint256 pending = (user.amount * rewardRate * (block.timestamp - user.timestamp)) / (100 * 1 days);
            user.rewards += pending;
        }

        user.amount += msg.value;
        user.timestamp = block.timestamp;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    function unstake(uint256 _amount) external {
        Stake storage user = stakes[msg.sender];
        require(_amount > 0 && _amount <= user.amount, "Invalid amount");
        require(block.timestamp >= user.timestamp + lockTime, "Tokens still locked");

        // Calculate rewards
        uint256 pending = (user.amount * rewardRate * (block.timestamp - user.timestamp)) / (100 * 1 days);
        uint256 payout = _amount + user.rewards + pending;

        require(address(this).balance >= payout + minimumFunding, "Insufficient contract balance");

        user.amount -= _amount;
        user.rewards = 0;
        user.timestamp = block.timestamp;
        totalStaked -= _amount;

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Transfer failed");

        emit Unstaked(msg.sender, _amount, payout - _amount);
    }

    function claimRewards() external {
        Stake storage user = stakes[msg.sender];
        uint256 pending = (user.amount * rewardRate * (block.timestamp - user.timestamp)) / (100 * 1 days);
        uint256 reward = user.rewards + pending;

        require(reward > 0, "No rewards");
        require(address(this).balance >= reward + minimumFunding, "Insufficient contract balance");

        user.rewards = 0;
        user.timestamp = block.timestamp;

        (bool success, ) = payable(msg.sender).call{value: reward}("");
        require(success, "Reward transfer failed");

        emit RewardClaimed(msg.sender, reward);
    }

    // ----------- Owner / DAO Functions -----------

    function setRewardRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0 && _newRate <= 10, "Reward rate 1-10%");
        rewardRate = _newRate;
        emit RewardRateUpdated(_newRate);
    }

    function setLockTime(uint256 _newLockTime) external onlyOwner {
        lockTime = _newLockTime;
        emit LockTimeUpdated(_newLockTime);
    }

    function setMinimumFunding(uint256 _newMinimum) external onlyOwner {
        minimumFunding = _newMinimum;
        emit MinimumFundingUpdated(_newMinimum);
    }

    receive() external payable {} // Allow contract to receive HBAR
}