// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FreeLanceDAOStaking
 * @dev Simplified HBAR staking contract with metadata support
 */
contract FreeLanceDAOStaking is Ownable, ReentrancyGuard {
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewards;
    }

    struct StakingMetadata {
        string stakerType;      // type of staker (e.g., "developer", "client")
        string description;     // description provided by staker
        string[] tags;          // tags (interests, skills, categories)
        uint256 feePaid;        // optional fee attached
    }

    mapping(address => Stake) public stakes;
    mapping(address => StakingMetadata) private stakingMetadata;
    address[] private stakersList;

    uint256 public totalStaked;
    uint256 public rewardRate;      // daily reward in % (1–10)
    uint256 public lockTime;        // lock duration in seconds
    uint256 public minimumFunding;  // reserve balance for contract safety

    /* ========== EVENTS ========== */
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event LockTimeUpdated(uint256 newLockTime);
    event MinimumFundingUpdated(uint256 newMinimum);
    event MetadataRegistered(
        address indexed staker,
        string stakerType,
        string description,
        string[] tags,
        uint256 feePaid
    );

    constructor(uint256 _rewardRate, uint256 _lockTime, uint256 _minimumFunding) {
        require(_rewardRate > 0 && _rewardRate <= 10, "Reward rate 1-10%");
        rewardRate = _rewardRate;
        lockTime = _lockTime;
        minimumFunding = _minimumFunding;
    }

    /* ========== CORE STAKING ========== */

    function stake() external payable nonReentrant {
        require(msg.value > 0, "Stake must be > 0");

        Stake storage user = stakes[msg.sender];

        // Update rewards before increasing stake
        if (user.amount > 0) {
            uint256 pending = (user.amount * rewardRate * (block.timestamp - user.timestamp)) / (100 * 1 days);
            user.rewards += pending;
        }

        user.amount += msg.value;
        user.timestamp = block.timestamp;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    function unstake(uint256 _amount) external nonReentrant {
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

    function claimRewards() external nonReentrant {
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

    /* ========== METADATA (NEW) ========== */

    function registerStakingMetadata(
        string calldata _type,
        string calldata _description,
        string[] calldata _tags
    ) external payable {
        StakingMetadata storage meta = stakingMetadata[msg.sender];
        meta.stakerType = _type;
        meta.description = _description;

        // Clear and copy tags
        delete meta.tags;
        for (uint256 i = 0; i < _tags.length; i++) {
            meta.tags.push(_tags[i]);
        }

        meta.feePaid += msg.value;

        if (meta.feePaid == msg.value) {
            stakersList.push(msg.sender);
        }

        emit MetadataRegistered(msg.sender, _type, _description, _tags, msg.value);
    }

    function getUserStaking(address user) external view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 rewards,
        string memory stakerType,
        string memory description,
        string[] memory tags,
        uint256 feePaid
    ) {
        Stake storage s = stakes[user];
        StakingMetadata storage m = stakingMetadata[user];
        return (s.amount, s.timestamp, s.rewards, m.stakerType, m.description, m.tags, m.feePaid);
    }

    function getAllStakingMetadata() external view returns (
        address[] memory stakers,
        string[] memory types_,
        string[] memory descriptions,
        string[][] memory tagsPerStaker,
        uint256[] memory fees
    ) {
        uint256 total = stakersList.length;
        stakers = new address[](total);
        types_ = new string[](total);
        descriptions = new string[](total);
        tagsPerStaker = new string[][](total);
        fees = new uint256[](total);

        for (uint256 i = 0; i < total; i++) {
            address user = stakersList[i];
            StakingMetadata storage m = stakingMetadata[user];
            stakers[i] = user;
            types_[i] = m.stakerType;
            descriptions[i] = m.description;
            fees[i] = m.feePaid;

            string[] memory tagMem = new string[](m.tags.length);
            for (uint256 t = 0; t < m.tags.length; t++) {
                tagMem[t] = m.tags[t];
            }
            tagsPerStaker[i] = tagMem;
        }
        return (stakers, types_, descriptions, tagsPerStaker, fees);
    }

    /* ========== OWNER FUNCTIONS ========== */

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

    /* ========== FALLBACKS ========== */
    receive() external payable {}
    fallback() external payable {}
}