// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  FreeLanceDAO Dispute Resolution V2
/// @author John Kenechukwu (Asmodeus)
/// @notice Handles typed disputes with DAO member voting.
///         Dispute creation fee is dynamically priced in ETH ≈ $0.34 USD via Chainlink.
///         Communicates with FreelanceDAOEscrowV2 for dispute lifecycle events.
/// @dev    UUPS-upgradeable.

import {Initializable}              from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable}         from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {AggregatorV3Interface}      from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import {IDisputeResolution} from "./interfaces/IDisputeResolution.sol";
import {IEscrow}            from "./interfaces/IEscrow.sol";
import {DataTypes}          from "./libraries/DataTypes.sol";
import {PriceConverter}     from "./libraries/PriceConverter.sol";

contract FreelanceDAODisputeV2 is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    IDisputeResolution
{
    using PriceConverter for AggregatorV3Interface;

    // ─────────────────────────────────────────────────────────────────────────
    //  Constants
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev Dispute creation fee target: $0.34 USD in 8-decimal form.
    uint256 public constant DISPUTE_FEE_USD_8DEC = 34_000_000; // $0.34

    // ─────────────────────────────────────────────────────────────────────────
    //  Storage
    // ─────────────────────────────────────────────────────────────────────────

    struct Dispute {
        uint256                  disputeId;
        uint256                  jobId;
        address                  client;
        address                  freelancer;
        string                   title;
        uint256                  amount;      // ETH amount under dispute (wei)
        string                   category;
        string                   description;
        DataTypes.DisputeReason  reason;
        uint256                  votesForClient;
        uint256                  votesForFreelancer;
        DataTypes.DisputeStatus  status;
        address                  winner;
        bool                     exists;
        uint256                  createdAt;
    }

    AggregatorV3Interface public priceFeed;
    address               public escrowContract;
    address               public daoTreasury;

    uint256 public nextDisputeId;
    uint256 public quorum; // minimum total votes needed to resolve

    mapping(address => bool)   public daoMembers;
    mapping(uint256 => Dispute) private _disputes;
    mapping(uint256 => mapping(address => bool)) public disputeVotes;
    mapping(address => uint256[]) private _userDisputeIds;

    /// @dev Storage gap.
    uint256[50] private __gap;

    // ─────────────────────────────────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────────────────────────────────

    event DaoMemberAdded(address indexed member);
    event DaoMemberRemoved(address indexed member);
    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed jobId,
        address indexed client,
        address freelancer,
        string  title,
        uint256 amount,
        DataTypes.DisputeReason reason,
        uint256 feePaid
    );
    event VoteCast(uint256 indexed disputeId, address indexed voter, bool voteForClient);
    event DisputeResolved(uint256 indexed disputeId, address indexed winner, DataTypes.DisputeStatus status, DataTypes.DisputeReason reason);
    event DisputeExecuted(uint256 indexed disputeId);
    event QuorumUpdated(uint256 oldQuorum, uint256 newQuorum);
    event EscrowContractUpdated(address indexed oldAddr, address indexed newAddr);
    event DaoTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event PriceFeedUpdated(address indexed oldFeed, address indexed newFeed);

    // ─────────────────────────────────────────────────────────────────────────
    //  Initializer
    // ─────────────────────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 _quorum,
        address _priceFeed,
        address _daoTreasury,
        address _owner
    ) external initializer {
        require(_quorum > 0,       "Dispute: quorum must be > 0");
        require(_priceFeed   != address(0), "Dispute: zero price feed");
        require(_daoTreasury != address(0), "Dispute: zero treasury");
        require(_owner       != address(0), "Dispute: zero owner");

        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        quorum        = _quorum;
        priceFeed     = AggregatorV3Interface(_priceFeed);
        daoTreasury   = _daoTreasury;
        nextDisputeId = 1;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Admin
    // ─────────────────────────────────────────────────────────────────────────

    function addDaoMember(address member) external onlyOwner {
        require(member != address(0),  "Dispute: zero address");
        require(!daoMembers[member],   "Dispute: already a member");
        daoMembers[member] = true;
        emit DaoMemberAdded(member);
    }

    function removeDaoMember(address member) external onlyOwner {
        require(daoMembers[member], "Dispute: not a DAO member");
        daoMembers[member] = false;
        emit DaoMemberRemoved(member);
    }

    function setQuorum(uint256 _quorum) external onlyOwner {
        require(_quorum > 0, "Dispute: quorum must be > 0");
        emit QuorumUpdated(quorum, _quorum);
        quorum = _quorum;
    }

    function setEscrowContract(address _escrow) external onlyOwner {
        require(_escrow != address(0), "Dispute: zero address");
        emit EscrowContractUpdated(escrowContract, _escrow);
        escrowContract = _escrow;
    }

    function setDaoTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Dispute: zero address");
        emit DaoTreasuryUpdated(daoTreasury, _treasury);
        daoTreasury = _treasury;
    }

    function setPriceFeed(address _feed) external onlyOwner {
        require(_feed != address(0), "Dispute: zero address");
        emit PriceFeedUpdated(address(priceFeed), _feed);
        priceFeed = AggregatorV3Interface(_feed);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Dispute Creation
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Open a dispute. ETH fee paid must be ≥ current ETH equivalent of $0.34.
    /// @param  jobId        Escrow job ID being disputed.
    /// @param  freelancer   Counterparty freelancer address.
    /// @param  title        Short dispute title.
    /// @param  amount       ETH amount under dispute (wei).
    /// @param  category     Category string.
    /// @param  description  Evidence / detailed description.
    /// @param  reason       Dispute reason type.
    function createDispute(
        uint256                  jobId,
        address                  freelancer,
        string calldata          title,
        uint256                  amount,
        string calldata          category,
        string calldata          description,
        DataTypes.DisputeReason  reason
    ) external payable nonReentrant returns (uint256 disputeId) {
        require(escrowContract != address(0), "Dispute: escrow not set");
        require(freelancer != address(0),     "Dispute: invalid freelancer");
        require(bytes(title).length > 0,      "Dispute: title required");

        // Enforce dynamic fee ≈ $0.34 USD
        uint256 requiredFeeWei = PriceConverter.usdToWei(DISPUTE_FEE_USD_8DEC, priceFeed);
        require(msg.value >= requiredFeeWei,  "Dispute: insufficient fee (~$0.34 in ETH)");

        disputeId = nextDisputeId++;
        Dispute storage d = _disputes[disputeId];
        d.disputeId   = disputeId;
        d.jobId       = jobId;
        d.client      = msg.sender;
        d.freelancer  = freelancer;
        d.title       = title;
        d.amount      = amount;
        d.category    = category;
        d.description = description;
        d.reason      = reason;
        d.status      = DataTypes.DisputeStatus.OPEN;
        d.exists      = true;
        d.createdAt   = block.timestamp;

        _userDisputeIds[msg.sender].push(disputeId);
        if (freelancer != msg.sender) {
            _userDisputeIds[freelancer].push(disputeId);
        }

        // Forward fee to DAO treasury
        (bool ok, ) = payable(daoTreasury).call{value: msg.value}("");
        require(ok, "Dispute: fee transfer failed");

        // Notify Escrow contract ← Dispute → Escrow
        IEscrow(escrowContract).notifyDisputeCreated(jobId, disputeId, reason);

        emit DisputeCreated(disputeId, jobId, msg.sender, freelancer, title, amount, reason, msg.value);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Voting
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice DAO members vote on disputes that require DAO resolution.
    function voteOnDispute(uint256 disputeId, bool voteForClient) external nonReentrant {
        require(daoMembers[msg.sender], "Dispute: only DAO members");

        Dispute storage d = _disputes[disputeId];
        require(d.exists,                               "Dispute: not found");
        require(d.status == DataTypes.DisputeStatus.OPEN, "Dispute: not open");
        require(!disputeVotes[disputeId][msg.sender],   "Dispute: already voted");
        require(_requiresDAOVote(d.reason),             "Dispute: does not require DAO vote");

        disputeVotes[disputeId][msg.sender] = true;

        if (voteForClient) {
            d.votesForClient++;
        } else {
            d.votesForFreelancer++;
        }

        emit VoteCast(disputeId, msg.sender, voteForClient);

        // Auto-resolve when quorum is reached
        if (d.votesForClient + d.votesForFreelancer >= quorum) {
            _resolveDispute(disputeId);
        }
    }

    /// @notice Resolve a LATE_DELIVERY dispute - no DAO vote needed.
    ///         Anyone can call once the dispute exists.
    function autoResolveDispute(uint256 disputeId) external nonReentrant {
        Dispute storage d = _disputes[disputeId];
        require(d.exists,                                 "Dispute: not found");
        require(d.status == DataTypes.DisputeStatus.OPEN,"Dispute: not open");
        require(!_requiresDAOVote(d.reason),              "Dispute: requires DAO vote first");

        // LATE_DELIVERY: smart contract already applied penalty in notifyDisputeCreated
        // Freelancer still gets paid (with penalty fee). Winner = freelancer.
        d.status = DataTypes.DisputeStatus.RESOLVED;
        d.winner = d.freelancer;

        emit DisputeResolved(disputeId, d.winner, d.status, d.reason);

        // Notify Escrow ← Dispute → Escrow
        IEscrow(escrowContract).notifyDisputeResolved(
            d.jobId,
            disputeId,
            d.reason,
            d.winner
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  IDisputeResolution Implementation
    // ─────────────────────────────────────────────────────────────────────────

    function getDisputeOutcome(uint256 disputeId)
        external
        view
        override
        returns (
            address winner,
            DataTypes.DisputeReason reason,
            DataTypes.DisputeStatus status
        )
    {
        Dispute storage d = _disputes[disputeId];
        require(d.exists, "Dispute: not found");
        return (d.winner, d.reason, d.status);
    }

    function markDisputeExecuted(uint256 disputeId) external override {
        require(msg.sender == escrowContract, "Dispute: only escrow");
        Dispute storage d = _disputes[disputeId];
        require(d.exists,                                    "Dispute: not found");
        require(d.status == DataTypes.DisputeStatus.RESOLVED,"Dispute: not resolved");
        d.status = DataTypes.DisputeStatus.EXECUTED;
        emit DisputeExecuted(disputeId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  View Helpers
    // ─────────────────────────────────────────────────────────────────────────

    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        require(_disputes[disputeId].exists, "Dispute: not found");
        return _disputes[disputeId];
    }

    /// @notice Paginated list of all disputes.
    function getDisputes(uint256 offset, uint256 limit) external view returns (Dispute[] memory page) {
        uint256 total = nextDisputeId - 1;
        if (offset >= total) return new Dispute[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        page = new Dispute[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = _disputes[i + 1];
        }
    }

    function getUserDisputes(address user) external view returns (Dispute[] memory) {
        uint256[] storage ids = _userDisputeIds[user];
        Dispute[] memory result = new Dispute[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _disputes[ids[i]];
        }
        return result;
    }

    /// @notice Paginated open disputes.
    function getOpenDisputes(uint256 offset, uint256 limit) external view returns (Dispute[] memory page) {
        uint256 total = nextDisputeId - 1;
        uint256 count = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (_disputes[i].status == DataTypes.DisputeStatus.OPEN) count++;
        }
        if (offset >= count) return new Dispute[](0);
        uint256 end = offset + limit > count ? count : offset + limit;
        page = new Dispute[](end - offset);
        uint256 idx = 0;
        uint256 pageIdx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (_disputes[i].status != DataTypes.DisputeStatus.OPEN) continue;
            if (idx >= offset && pageIdx < page.length) {
                page[pageIdx++] = _disputes[i];
            }
            idx++;
            if (pageIdx == page.length) break;
        }
    }

    /// @notice Returns the current dispute fee in wei (~$0.34 at live ETH/USD price).
    function currentDisputeFeeWei() external view returns (uint256) {
        return PriceConverter.usdToWei(DISPUTE_FEE_USD_8DEC, priceFeed);
    }

    function requiresDAOVote(DataTypes.DisputeReason reason) external pure returns (bool) {
        return _requiresDAOVote(reason);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Internal
    // ─────────────────────────────────────────────────────────────────────────

    function _resolveDispute(uint256 disputeId) internal {
        Dispute storage d = _disputes[disputeId];

        if (d.votesForClient > d.votesForFreelancer) {
            d.status = DataTypes.DisputeStatus.RESOLVED;
            d.winner = d.client;
        } else if (d.votesForFreelancer > d.votesForClient) {
            d.status = DataTypes.DisputeStatus.RESOLVED;
            d.winner = d.freelancer;
        } else {
            // Tie - reject dispute
            d.status = DataTypes.DisputeStatus.REJECTED;
            d.winner = address(0);
        }

        emit DisputeResolved(disputeId, d.winner, d.status, d.reason);

        if (d.status == DataTypes.DisputeStatus.RESOLVED) {
            IEscrow(escrowContract).notifyDisputeResolved(
                d.jobId,
                disputeId,
                d.reason,
                d.winner
            );
        }
    }

    /// @dev LATE_DELIVERY is auto-resolved by smart contract.
    ///      Everything else requires DAO voting.
    function _requiresDAOVote(DataTypes.DisputeReason reason) internal pure returns (bool) {
        return reason != DataTypes.DisputeReason.LATE_DELIVERY;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  UUPS
    // ─────────────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    receive() external payable {}
}