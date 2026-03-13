// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  FreeLanceDAO Staking V2
/// @author John Kenechukwu (Asmodeus)
/// @notice ETH staking contract for governance power on Base blockchain.
///         No yield/rewards - staked ETH grants voting weight and unlocks
///         proposal tiers in the Proposals contract.
/// @dev    UUPS-upgradeable. Communicates bidirectionally with Proposals.

import {Initializable}              from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable}         from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {AggregatorV3Interface}      from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import {IStaking}          from "./interfaces/IStaking.sol";
import {IProposals}        from "./interfaces/IProposals.sol";
import {PriceConverter}    from "./libraries/PriceConverter.sol";

contract FreelanceDAOStaking is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    IStaking
{
    using PriceConverter for AggregatorV3Interface;

    // ─────────────────────────────────────────────────────────────────────────
    //  Constants
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev Minimum stake = $1 USD (8-decimal representation: 1 * 1e8).
    uint256 public constant MIN_STAKE_USD_8DEC = 1e8; // $1.00

    // ─────────────────────────────────────────────────────────────────────────
    //  Storage
    // ─────────────────────────────────────────────────────────────────────────

    struct Stake {
        uint256 amount;    // wei staked
        uint256 timestamp; // last stake/unstake action
    }

    struct StakingMetadata {
        string   stakerType;   // e.g., "developer", "client", "investor"
        string   description;
        string[] tags;
        uint256  feePaid;      // native ETH fee optionally paid on metadata registration
    }

    /// @notice ETH/USD Chainlink price feed (Base Sepolia: 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb)
    AggregatorV3Interface public priceFeed;

    /// @notice Address of the Proposals contract (for bidirectional notifications).
    ///         Can be address(0) if not yet wired.
    address public proposalsContract;

    /// @notice DAO Treasury - receives optional metadata fees.
    address public daoTreasury;

    /// @notice Total ETH staked across all users (wei).
    uint256 public totalStaked;

    mapping(address => Stake)           private _stakes;
    mapping(address => StakingMetadata) private _metadata;

    /// @dev Ordered list of stakers (for enumeration). An address is added only once.
    address[] private _stakersList;
    mapping(address => bool) private _isStaker;

    /// @dev Storage gap for future upgrades - 50 slots.
    uint256[50] private __gap;

    // ─────────────────────────────────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────────────────────────────────

    event Staked(address indexed user, uint256 weiAmount, uint256 usdValue8dec);
    event Unstaked(address indexed user, uint256 weiAmount, uint256 remainingWei);
    event MetadataRegistered(address indexed staker, string stakerType, string description, string[] tags, uint256 feePaid);
    event ProposalsContractUpdated(address indexed oldAddr, address indexed newAddr);
    event PriceFeedUpdated(address indexed oldFeed, address indexed newFeed);
    event DaoTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event EmergencyWithdraw(address indexed owner, uint256 amount);

    // ─────────────────────────────────────────────────────────────────────────
    //  Initializer  (replaces constructor for UUPS)
    // ─────────────────────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialise the staking contract.
    /// @param  _priceFeed    Chainlink ETH/USD AggregatorV3Interface address.
    /// @param  _daoTreasury  Address that receives metadata fees.
    /// @param  _owner        Contract owner (upgrade authority).
    function initialize(
        address _priceFeed,
        address _daoTreasury,
        address _owner
    ) external initializer {
        require(_priceFeed   != address(0), "Staking: zero price feed");
        require(_daoTreasury != address(0), "Staking: zero treasury");
        require(_owner       != address(0), "Staking: zero owner");

        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        priceFeed   = AggregatorV3Interface(_priceFeed);
        daoTreasury = _daoTreasury;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Admin
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Set or update the Proposals contract address.
    function setProposalsContract(address _proposals) external onlyOwner {
        require(_proposals != address(0), "Staking: zero proposals address");
        emit ProposalsContractUpdated(proposalsContract, _proposals);
        proposalsContract = _proposals;
    }

    /// @notice Update the Chainlink price feed address.
    function setPriceFeed(address _feed) external onlyOwner {
        require(_feed != address(0), "Staking: zero feed address");
        emit PriceFeedUpdated(address(priceFeed), _feed);
        priceFeed = AggregatorV3Interface(_feed);
    }

    /// @notice Update the DAO Treasury address.
    function setDaoTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Staking: zero treasury");
        emit DaoTreasuryUpdated(daoTreasury, _treasury);
        daoTreasury = _treasury;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Core Staking
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Stake ETH. Minimum stake is worth $1 USD (evaluated via Chainlink).
    function stake() external payable nonReentrant {
        require(msg.value > 0, "Staking: must send ETH");

        // Enforce minimum stake of $1 USD
        uint256 usdValue = PriceConverter.weiToUSD(msg.value, priceFeed);
        require(usdValue >= MIN_STAKE_USD_8DEC, "Staking: stake below $1 USD minimum");

        Stake storage s = _stakes[msg.sender];
        s.amount    += msg.value;
        s.timestamp  = block.timestamp;
        totalStaked += msg.value;

        // Register staker in enumeration list (first time only)
        if (!_isStaker[msg.sender]) {
            _isStaker[msg.sender] = true;
            _stakersList.push(msg.sender);
        }

        emit Staked(msg.sender, msg.value, usdValue);

        // ── Bidirectional notification → Proposals ───────────────────────────
        _notifyProposals(msg.sender, s.amount);
    }

    /// @notice Unstake a specified amount of ETH.
    /// @param  amount  Wei to withdraw. Must not exceed current stake.
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Staking: zero amount");
        Stake storage s = _stakes[msg.sender];
        require(s.amount >= amount, "Staking: insufficient staked balance");

        s.amount    -= amount;
        s.timestamp  = block.timestamp;
        totalStaked -= amount;

        // ── Bidirectional notification → Proposals ───────────────────────────
        _notifyProposals(msg.sender, s.amount);

        // Transfer ETH back to staker
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Staking: ETH transfer failed");

        emit Unstaked(msg.sender, amount, s.amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Metadata
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Register or update staking metadata.
    ///         Any ETH sent is forwarded to the DAO treasury.
    function registerMetadata(
        string calldata stakerType,
        string calldata description,
        string[] calldata tags
    ) external payable nonReentrant {
        require(_stakes[msg.sender].amount > 0, "Staking: must be an active staker");
        require(bytes(stakerType).length > 0,   "Staking: stakerType required");

        StakingMetadata storage m = _metadata[msg.sender];
        m.stakerType  = stakerType;
        m.description = description;
        m.feePaid    += msg.value;

        // Overwrite tags
        delete m.tags;
        for (uint256 i = 0; i < tags.length; i++) {
            m.tags.push(tags[i]);
        }

        // Forward any ETH fee to treasury
        if (msg.value > 0) {
            (bool ok, ) = payable(daoTreasury).call{value: msg.value}("");
            require(ok, "Staking: fee transfer failed");
        }

        emit MetadataRegistered(msg.sender, stakerType, description, tags, msg.value);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  IStaking Implementation
    // ─────────────────────────────────────────────────────────────────────────

    function getStakedAmount(address user) external view override returns (uint256) {
        return _stakes[user].amount;
    }

    function getStakedUSDValue(address user) external view override returns (uint256) {
        return PriceConverter.weiToUSD(_stakes[user].amount, priceFeed);
    }

    function getStakeTimestamp(address user) external view override returns (uint256) {
        return _stakes[user].timestamp;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  View Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Returns full stake + metadata for a given user.
    function getUserStaking(address user) external view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 usdValue8dec,
        string memory stakerType,
        string memory description,
        string[] memory tags,
        uint256 feePaid
    ) {
        Stake           storage s = _stakes[user];
        StakingMetadata storage m = _metadata[user];
        return (
            s.amount,
            s.timestamp,
            PriceConverter.weiToUSD(s.amount, priceFeed),
            m.stakerType,
            m.description,
            m.tags,
            m.feePaid
        );
    }

    /// @notice Paginated list of stakers.
    /// @param  offset  Starting index.
    /// @param  limit   Maximum number of stakers to return.
    function getStakers(uint256 offset, uint256 limit) external view returns (address[] memory page) {
        uint256 total = _stakersList.length;
        if (offset >= total) return new address[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        page = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = _stakersList[i];
        }
    }

    /// @notice Total number of unique stakers.
    function stakerCount() external view returns (uint256) {
        return _stakersList.length;
    }

    /// @notice Returns the minimum ETH stake required at current ETH/USD price.
    function minimumStakeWei() external view returns (uint256) {
        return PriceConverter.usdToWei(MIN_STAKE_USD_8DEC, priceFeed);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Internal Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev Notify the Proposals contract that a user's stake changed.
    ///      Silently skips if proposalsContract is not yet set.
    function _notifyProposals(address user, uint256 newStakedWei) internal {
        if (proposalsContract == address(0)) return;
        // Low-level call - failure must NOT revert the staking action itself.
        (bool ok, ) = proposalsContract.call(
            abi.encodeWithSelector(IProposals.onStakeChanged.selector, user, newStakedWei)
        );
        // Silently ignore failure (Proposals contract may not be deployed yet on first stake)
        if (!ok) {} // no-op
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  UUPS
    // ─────────────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ─────────────────────────────────────────────────────────────────────────
    //  Fallback
    // ─────────────────────────────────────────────────────────────────────────

    receive() external payable {}
}