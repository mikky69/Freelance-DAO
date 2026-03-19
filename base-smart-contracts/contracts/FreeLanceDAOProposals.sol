// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  FreeLanceDAO Proposals V2
/// @author John Kenechukwu (Asmodeus)
/// @notice Governance proposals with two tiers:
///         MINOR - open to anyone staking ≥ $1 USD.
///         MAJOR - requires ≥ $100 USD staked at creation time (Chainlink).
///         Voting weight = staked ETH (snapshotted on first vote per proposal).
/// @dev    UUPS-upgradeable. Communicates bidirectionally with Staking.

import {Initializable}              from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable}         from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {AggregatorV3Interface}      from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import {IStaking}       from "./interfaces/IStaking.sol";
import {IProposals}     from "./interfaces/IProposals.sol";
import {DataTypes}      from "./libraries/DataTypes.sol";
import {PriceConverter} from "./libraries/PriceConverter.sol";

contract FreelanceDAOProposals is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    IProposals
{
    using PriceConverter for AggregatorV3Interface;

    // ─────────────────────────────────────────────────────────────────────────
    //  Constants
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev $100 USD in 8-decimal form - threshold for MAJOR proposals.
    uint256 public constant MAJOR_THRESHOLD_USD_8DEC = 100e8;  // $100.00

    /// @dev $1 USD in 8-decimal form - minimum stake for MINOR proposals.
    uint256 public constant MINOR_THRESHOLD_USD_8DEC = 1e8;    // $1.00

    // ─────────────────────────────────────────────────────────────────────────
    //  Storage
    // ─────────────────────────────────────────────────────────────────────────

    struct Proposal {
        uint256              id;
        address              proposer;
        DataTypes.ProposalTier tier;
        string               title;
        string               category;
        string               description;
        string[]             tags;
        uint256              yesVotes;
        uint256              noVotes;
        uint256              deadline;
        bool                 finalized;
        bool                 approved;
        uint256              feePaid;  // ETH fee paid by proposer
        uint256              createdAt;
    }

    /// @notice Flat struct safe for returning in view arrays (no nested dynamics).
    struct ProposalView {
        uint256              id;
        address              proposer;
        DataTypes.ProposalTier tier;
        string               title;
        string               category;
        string               description;
        uint256              yesVotes;
        uint256              noVotes;
        uint256              deadline;
        bool                 finalized;
        bool                 approved;
        uint256              feePaid;
        uint256              participation;
        uint256              createdAt;
    }

    // ── Core state ────────────────────────────────────────────────────────────

    AggregatorV3Interface public priceFeed;
    IStaking              public stakingContract;
    address               public stakingContractAddress; // kept for cross-contract caller check
    address               public daoTreasury;

    uint256 public proposalCount;
    uint256 public votingPeriod;            // seconds; default 3 days
    uint256 public quorumThresholdWei;      // minimum total voting weight for quorum

    mapping(uint256 => Proposal) private _proposals;
    mapping(uint256 => mapping(address => bool))    public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public votingPowerSnapshot;
    mapping(address => uint256[]) private _userProposals;

    /// @dev Storage gap for future upgrades.
    uint256[50] private __gap;

    // ─────────────────────────────────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────────────────────────────────

    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        DataTypes.ProposalTier tier,
        string  title,
        string  category,
        uint256 deadline,
        uint256 feePaid
    );
    event VoteCast(uint256 indexed id, address indexed voter, uint256 weight, bool support);
    event ProposalFinalized(uint256 indexed id, bool approved, uint256 yesVotes, uint256 noVotes);
    event StakeChangedNotified(address indexed user, uint256 newStakedWei);
    event StakingContractUpdated(address indexed oldAddr, address indexed newAddr);
    event PriceFeedUpdated(address indexed oldFeed, address indexed newFeed);
    event DaoTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event VotingPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event QuorumUpdated(uint256 oldQuorum, uint256 newQuorum);
    event TreasuryWithdraw(address indexed to, uint256 amount);

    // ─────────────────────────────────────────────────────────────────────────
    //  Initializer
    // ─────────────────────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _stakingContract,
        address _priceFeed,
        address _daoTreasury,
        address _owner
    ) external initializer {
        require(_stakingContract != address(0), "Proposals: zero staking address");
        require(_priceFeed       != address(0), "Proposals: zero price feed");
        require(_daoTreasury     != address(0), "Proposals: zero treasury");
        require(_owner           != address(0), "Proposals: zero owner");

        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        stakingContract        = IStaking(_stakingContract);
        stakingContractAddress = _stakingContract;
        priceFeed              = AggregatorV3Interface(_priceFeed);
        daoTreasury            = _daoTreasury;
        votingPeriod           = 3 days;
        quorumThresholdWei     = 1; // default: any participation
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Admin
    // ─────────────────────────────────────────────────────────────────────────

    function setStakingContract(address _staking) external onlyOwner {
        require(_staking != address(0), "Proposals: zero address");
        emit StakingContractUpdated(address(stakingContract), _staking);
        stakingContract        = IStaking(_staking);
        stakingContractAddress = _staking;
    }

    function setPriceFeed(address _feed) external onlyOwner {
        require(_feed != address(0), "Proposals: zero address");
        emit PriceFeedUpdated(address(priceFeed), _feed);
        priceFeed = AggregatorV3Interface(_feed);
    }

    function setDaoTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Proposals: zero address");
        emit DaoTreasuryUpdated(daoTreasury, _treasury);
        daoTreasury = _treasury;
    }

    function setVotingPeriod(uint256 _period) external onlyOwner {
        require(_period > 0, "Proposals: period must be > 0");
        emit VotingPeriodUpdated(votingPeriod, _period);
        votingPeriod = _period;
    }

    /// @notice Set the quorum in wei - total voting weight (yes + no) must meet this.
    function setQuorumThresholdWei(uint256 _quorum) external onlyOwner {
        emit QuorumUpdated(quorumThresholdWei, _quorum);
        quorumThresholdWei = _quorum;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  IProposals Implementation  (← Staking → Proposals notification)
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Called by the Staking contract when a user's stake changes.
    ///         Only callable by the registered staking contract.
    function onStakeChanged(address user, uint256 newStakedWei) external override {
        require(msg.sender == stakingContractAddress, "Proposals: caller not staking contract");
        // Emit event for off-chain monitoring (e.g., re-evaluate proposal eligibility in UI)
        emit StakeChangedNotified(user, newStakedWei);
        // On-chain: snapshot-based voting means past votes are unaffected.
        // Future proposal creation eligibility is re-evaluated at creation time.
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Proposal Creation
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Create a new proposal.
    /// @param  tier         MINOR or MAJOR. MAJOR requires ≥ $100 staked.
    /// @param  title        Short proposal title.
    /// @param  category     Category string (e.g., "governance", "development").
    /// @param  description  Full description (or IPFS CID).
    /// @param  tags         Array of tags.
    /// @dev    Any ETH sent is recorded as `feePaid` and forwarded to DAO treasury.
    function createProposal(
        DataTypes.ProposalTier tier,
        string calldata title,
        string calldata category,
        string calldata description,
        string[] calldata tags
    ) external payable nonReentrant returns (uint256 proposalId) {
        require(bytes(title).length > 0,       "Proposals: title required");
        require(bytes(description).length > 0,  "Proposals: description required");

        // ── Stake-based tier gating ──────────────────────────────────────────
        uint256 stakedWei = stakingContract.getStakedAmount(msg.sender);
        uint256 stakedUSD = PriceConverter.weiToUSD(stakedWei, priceFeed);

        if (tier == DataTypes.ProposalTier.MAJOR) {
            require(
                stakedUSD >= MAJOR_THRESHOLD_USD_8DEC,
                "Proposals: MAJOR requires >= $100 USD staked"
            );
        } else {
            // MINOR: must have at least $1 staked
            require(
                stakedUSD >= MINOR_THRESHOLD_USD_8DEC,
                "Proposals: MINOR requires >= $1 USD staked"
            );
        }

        // ── Create proposal ──────────────────────────────────────────────────
        proposalId = ++proposalCount;
        Proposal storage p = _proposals[proposalId];
        p.id          = proposalId;
        p.proposer    = msg.sender;
        p.tier        = tier;
        p.title       = title;
        p.category    = category;
        p.description = description;
        p.deadline    = block.timestamp + votingPeriod;
        p.feePaid     = msg.value;
        p.createdAt   = block.timestamp;

        for (uint256 i = 0; i < tags.length; i++) {
            p.tags.push(tags[i]);
        }

        _userProposals[msg.sender].push(proposalId);

        // Forward fee to DAO treasury
        if (msg.value > 0) {
            (bool ok, ) = payable(daoTreasury).call{value: msg.value}("");
            require(ok, "Proposals: fee transfer failed");
        }

        emit ProposalCreated(proposalId, msg.sender, tier, title, category, p.deadline, msg.value);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Voting  (← Proposals reads from Staking for weight)
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Cast a weighted vote. Weight = ETH staked at time of first vote.
    /// @param  proposalId  The proposal to vote on.
    /// @param  support     true = YES, false = NO.
    function vote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage p = _proposals[proposalId];
        require(p.id != 0,                           "Proposals: does not exist");
        require(block.timestamp < p.deadline,        "Proposals: voting ended");
        require(!hasVoted[proposalId][msg.sender],   "Proposals: already voted");

        // Snapshot voting power from Staking contract
        uint256 weight = stakingContract.getStakedAmount(msg.sender);
        require(weight > 0, "Proposals: no stake - cannot vote");

        votingPowerSnapshot[proposalId][msg.sender] = weight;
        hasVoted[proposalId][msg.sender]            = true;

        if (support) {
            p.yesVotes += weight;
        } else {
            p.noVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, weight, support);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Finalization
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Finalize a proposal after its voting period ends (anyone can call).
    function finalizeProposal(uint256 proposalId) external {
        Proposal storage p = _proposals[proposalId];
        require(p.id != 0,                     "Proposals: does not exist");
        require(block.timestamp >= p.deadline, "Proposals: voting still active");
        require(!p.finalized,                  "Proposals: already finalized");

        p.finalized = true;

        uint256 participation = p.yesVotes + p.noVotes;
        if (participation >= quorumThresholdWei && p.yesVotes > p.noVotes) {
            p.approved = true;
        }

        emit ProposalFinalized(proposalId, p.approved, p.yesVotes, p.noVotes);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Treasury
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Emergency: owner can sweep any ETH sitting in contract to treasury.
    function withdrawToTreasury() external onlyOwner nonReentrant {
        uint256 bal = address(this).balance;
        require(bal > 0, "Proposals: no balance");
        (bool ok, ) = payable(daoTreasury).call{value: bal}("");
        require(ok, "Proposals: transfer failed");
        emit TreasuryWithdraw(daoTreasury, bal);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  View Helpers
    // ─────────────────────────────────────────────────────────────────────────

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        require(_proposals[proposalId].id != 0, "Proposals: does not exist");
        return _proposals[proposalId];
    }

    /// @notice Paginated list of all proposals.
    function getProposals(uint256 offset, uint256 limit) external view returns (ProposalView[] memory page) {
        uint256 total = proposalCount;
        if (offset >= total) return new ProposalView[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        page = new ProposalView[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            uint256 pid = i + 1;
            page[i - offset] = _toView(pid);
        }
    }

    /// @notice All proposals by a specific user.
    function getUserProposals(address user) external view returns (ProposalView[] memory) {
        uint256[] storage ids = _userProposals[user];
        ProposalView[] memory result = new ProposalView[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _toView(ids[i]);
        }
        return result;
    }

    /// @notice Get proposals filtered by tier.
    function getProposalsByTier(
        DataTypes.ProposalTier tier,
        uint256 offset,
        uint256 limit
    ) external view returns (ProposalView[] memory page) {
        // First pass: count matching
        uint256 count = 0;
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (_proposals[i].tier == tier) count++;
        }
        if (offset >= count) return new ProposalView[](0);
        uint256 end = offset + limit > count ? count : offset + limit;
        page = new ProposalView[](end - offset);
        uint256 idx = 0;
        uint256 pageIdx = 0;
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (_proposals[i].tier != tier) continue;
            if (idx >= offset && pageIdx < page.length) {
                page[pageIdx++] = _toView(i);
            }
            idx++;
            if (pageIdx == page.length) break;
        }
    }

    /// @notice Voter's snapshot for a given proposal.
    function getVoterSnapshot(uint256 proposalId, address voter) external view returns (uint256) {
        return votingPowerSnapshot[proposalId][voter];
    }

    /// @notice Returns whether a user currently qualifies to make a MAJOR proposal.
    function canCreateMajorProposal(address user) external view returns (bool, uint256 currentUSD8dec) {
        uint256 stakedWei = stakingContract.getStakedAmount(user);
        currentUSD8dec    = PriceConverter.weiToUSD(stakedWei, priceFeed);
        return (currentUSD8dec >= MAJOR_THRESHOLD_USD_8DEC, currentUSD8dec);
    }

    /// @notice Returns whether a user qualifies to make a MINOR proposal.
    function canCreateMinorProposal(address user) external view returns (bool, uint256 currentUSD8dec) {
        uint256 stakedWei = stakingContract.getStakedAmount(user);
        currentUSD8dec    = PriceConverter.weiToUSD(stakedWei, priceFeed);
        return (currentUSD8dec >= MINOR_THRESHOLD_USD_8DEC, currentUSD8dec);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Internal
    // ─────────────────────────────────────────────────────────────────────────

    function _toView(uint256 pid) internal view returns (ProposalView memory) {
        Proposal storage p = _proposals[pid];
        return ProposalView({
            id:            p.id,
            proposer:      p.proposer,
            tier:          p.tier,
            title:         p.title,
            category:      p.category,
            description:   p.description,
            yesVotes:      p.yesVotes,
            noVotes:       p.noVotes,
            deadline:      p.deadline,
            finalized:     p.finalized,
            approved:      p.approved,
            feePaid:       p.feePaid,
            participation: p.yesVotes + p.noVotes,
            createdAt:     p.createdAt
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  UUPS
    // ─────────────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    receive() external payable {}
}