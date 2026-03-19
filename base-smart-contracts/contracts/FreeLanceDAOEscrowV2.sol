// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  FreeLanceDAO Escrow V2
/// @author John Kenechukwu (Asmodeus)
/// @notice ETH escrow with fixed & milestone job types, deadline tracking,
///         withdrawal-based fees, and full dispute resolution integration.
/// @dev    UUPS-upgradeable. Communicates with FreelanceDAODisputeV2.

import {Initializable}              from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable}         from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import {IEscrow}              from "./interfaces/IEscrow.sol";
import {IDisputeResolution}   from "./interfaces/IDisputeResolution.sol";
import {DataTypes}            from "./libraries/DataTypes.sol";
import {FeeCalculator}        from "./libraries/FeeCalculator.sol";

contract FreelanceDAOEscrowV2 is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    IEscrow
{
    using FeeCalculator for uint256;

    // ─────────────────────────────────────────────────────────────────────────
    //  Storage
    // ─────────────────────────────────────────────────────────────────────────

    enum JobType { FIXED, MILESTONE }

    enum Status {
        OPEN,       // posted, taking requests
        PENDING,    // freelancer assigned, work in progress
        DELIVERY,   // freelancer marked delivery
        CONFIRMED,  // client confirmed - payment ready to withdraw
        DISPUTED,   // under dispute
        REFUNDED,   // refunded to client
        CANCELLED   // cancelled before work started
    }

    struct Milestone {
        uint256 amount;
        bool    confirmed;
        bool    delivered;
        bool    withdrawn;
        uint256 withdrawnAt;
    }

    struct Job {
        uint256    jobId;
        JobType    jobType;
        address    client;
        address    freelancer;
        uint256    totalAmount;
        uint256    minimumBudget;
        uint256    maximumBudget;
        uint256    confirmedAmount;
        uint256    withdrawnAmount;
        uint256    createdAt;
        uint256    deadline;
        Status     status;
        bool       funded;
        bool       lateDeliveryPenalty;
        bool       isLate;
        string     jobTitle;
        string     jobCategory;
        string     projectDescription;
        string[]   requiredSkills;
        string     projectDuration;
        bool       exists;
    }

    struct JobParams {
        string   jobTitle;
        string   jobCategory;
        string   projectDescription;
        string[] requiredSkills;
        string   projectDuration;
        uint256  minimumBudget;
        uint256  maximumBudget;
        uint256  deadline;
    }

    // ── Contract state ───────────────────────────────────────────────────────

    address public daoTreasury;
    address public disputeContract;

    uint256 public totalDaoFeesCollected;
    uint256 public nextJobId;

    uint256 public constant MAX_BATCH_JOBS = 20; // gas safety cap

    mapping(uint256 => Job)                        private _jobs;
    mapping(uint256 => Milestone[])                private _milestones;
    mapping(address => mapping(uint256 => bool))   public  requested;
    mapping(uint256 => uint256)                    public  freelancerEarnings;
    mapping(address => uint256[])                  private _freelancerJobIds;

    /// @dev Storage gap.
    uint256[50] private __gap;

    // ─────────────────────────────────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────────────────────────────────

    event JobCreated(uint256 indexed jobId, JobType jobType, address indexed client, uint256 totalAmount, uint256 deadline);
    event JobFunded(uint256 indexed jobId, uint256 amount);
    event ProviderRequested(uint256 indexed jobId, address indexed provider);
    event ProviderApproved(uint256 indexed jobId, address indexed provider);
    event DeliveryMarked(uint256 indexed jobId, uint256 milestoneIndex, address indexed provider, bool isLate);
    event MilestoneConfirmed(uint256 indexed jobId, uint256 milestoneIndex, uint256 amount);
    event FixedJobConfirmed(uint256 indexed jobId, uint256 amount);
    event WithdrawalMade(uint256 indexed jobId, address indexed freelancer, uint256 netAmount, uint256 fee, bool isEarlyWithdrawal);
    event BatchWithdrawal(address indexed freelancer, uint256[] jobIds, uint256 totalNet, uint256 totalFee);
    event JobRefunded(uint256 indexed jobId, uint256 refundedAmount);
    event JobCancelled(uint256 indexed jobId);
    event DaoFeesWithdrawn(address indexed to, uint256 amount);
    event DaoTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event DisputeContractUpdated(address indexed oldContract, address indexed newContract);
    event DisputeNotificationReceived(uint256 indexed jobId, uint256 indexed disputeId, DataTypes.DisputeReason reason);
    event DisputeResolutionReceived(uint256 indexed jobId, uint256 indexed disputeId, DataTypes.DisputeReason reason, address winner);
    event LateDeliveryPenaltyApplied(uint256 indexed jobId);

    // ─────────────────────────────────────────────────────────────────────────
    //  Initializer
    // ─────────────────────────────────────────────────────────────────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _daoTreasury, address _owner) external initializer {
        require(_daoTreasury != address(0), "Escrow: zero treasury");
        require(_owner       != address(0), "Escrow: zero owner");

        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        daoTreasury = _daoTreasury;
        nextJobId   = 1;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Admin
    // ─────────────────────────────────────────────────────────────────────────

    function setDaoTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Escrow: zero address");
        emit DaoTreasuryUpdated(daoTreasury, _treasury);
        daoTreasury = _treasury;
    }

    function setDisputeContract(address _dispute) external onlyOwner {
        require(_dispute != address(0), "Escrow: zero address");
        emit DisputeContractUpdated(disputeContract, _dispute);
        disputeContract = _dispute;
    }

    function withdrawDaoFees(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0,                         "Escrow: zero amount");
        require(amount <= totalDaoFeesCollected,    "Escrow: insufficient fees");
        totalDaoFeesCollected -= amount;
        _safeSend(daoTreasury, amount);
        emit DaoFeesWithdrawn(daoTreasury, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Job Creation & Funding
    // ─────────────────────────────────────────────────────────────────────────

    function createFixedJob(JobParams calldata params) external payable nonReentrant returns (uint256) {
        require(msg.value > 0,                       "Escrow: must fund job");
        require(bytes(params.jobTitle).length > 0,   "Escrow: title required");
        require(bytes(params.projectDescription).length > 0, "Escrow: description required");
        require(params.deadline > block.timestamp,   "Escrow: deadline must be future");

        uint256 jid = nextJobId++;
        Job storage j = _jobs[jid];
        j.jobId           = jid;
        j.jobType         = JobType.FIXED;
        j.client          = msg.sender;
        j.totalAmount     = msg.value;
        j.minimumBudget   = params.minimumBudget > 0 ? params.minimumBudget : msg.value;
        j.maximumBudget   = params.maximumBudget > 0 ? params.maximumBudget : msg.value;
        j.deadline        = params.deadline;
        j.status          = Status.OPEN;
        j.funded          = true;
        j.exists          = true;
        j.createdAt       = block.timestamp;
        j.jobTitle        = params.jobTitle;
        j.jobCategory     = params.jobCategory;
        j.projectDescription = params.projectDescription;
        j.requiredSkills  = params.requiredSkills;
        j.projectDuration = params.projectDuration;

        emit JobCreated(jid, JobType.FIXED, msg.sender, msg.value, params.deadline);
        emit JobFunded(jid, msg.value);
        return jid;
    }

    function createMilestoneJob(
        uint256[] calldata milestoneAmounts,
        JobParams calldata params
    ) external payable nonReentrant returns (uint256) {
        require(milestoneAmounts.length > 0,         "Escrow: need >= 1 milestone");
        require(bytes(params.jobTitle).length > 0,   "Escrow: title required");
        require(bytes(params.projectDescription).length > 0, "Escrow: description required");
        require(params.deadline > block.timestamp,   "Escrow: deadline must be future");

        uint256 total = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneAmounts[i] > 0, "Escrow: milestone amount > 0");
            total += milestoneAmounts[i];
        }

        uint256 jid = nextJobId++;
        Job storage j = _jobs[jid];
        j.jobId           = jid;
        j.jobType         = JobType.MILESTONE;
        j.client          = msg.sender;
        j.totalAmount     = total;
        j.minimumBudget   = total;
        j.maximumBudget   = total;
        j.deadline        = params.deadline;
        j.status          = Status.OPEN;
        j.exists          = true;
        j.createdAt       = block.timestamp;
        j.jobTitle        = params.jobTitle;
        j.jobCategory     = params.jobCategory;
        j.projectDescription = params.projectDescription;
        j.requiredSkills  = params.requiredSkills;
        j.projectDuration = params.projectDuration;

        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            _milestones[jid].push(Milestone({
                amount:      milestoneAmounts[i],
                confirmed:   false,
                delivered:   false,
                withdrawn:   false,
                withdrawnAt: 0
            }));
        }

        if (msg.value > 0) {
            require(msg.value == total, "Escrow: msg.value must equal total");
            j.funded = true;
            emit JobFunded(jid, msg.value);
        }

        emit JobCreated(jid, JobType.MILESTONE, msg.sender, total, params.deadline);
        return jid;
    }

    function fundJob(uint256 jobId) external payable nonReentrant {
        Job storage j = _jobs[jobId];
        require(j.exists,              "Escrow: job not found");
        require(msg.sender == j.client,"Escrow: only client");
        require(!j.funded,             "Escrow: already funded");
        require(msg.value == j.totalAmount, "Escrow: must send full amount");
        j.funded = true;
        emit JobFunded(jobId, msg.value);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Request / Approve Provider
    // ─────────────────────────────────────────────────────────────────────────

    function requestJob(uint256 jobId) external {
        Job storage j = _jobs[jobId];
        require(j.exists,               "Escrow: job not found");
        require(msg.sender != j.client, "Escrow: client cannot request");
        require(j.status == Status.OPEN,"Escrow: job not open");
        requested[msg.sender][jobId] = true;
        emit ProviderRequested(jobId, msg.sender);
    }

    function approveProvider(uint256 jobId, address provider) external {
        Job storage j = _jobs[jobId];
        require(j.exists,                    "Escrow: job not found");
        require(msg.sender == j.client,      "Escrow: only client");
        require(j.status == Status.OPEN,     "Escrow: job not open");
        require(j.funded,                    "Escrow: fund job first");
        require(requested[provider][jobId],  "Escrow: provider did not apply");

        j.freelancer = provider;
        j.status     = Status.PENDING;
        _freelancerJobIds[provider].push(jobId);

        emit ProviderApproved(jobId, provider);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Delivery Flow
    // ─────────────────────────────────────────────────────────────────────────

    function markDelivery(uint256 jobId, uint256 milestoneIndex) external {
        Job storage j = _jobs[jobId];
        require(j.exists,                  "Escrow: job not found");
        require(msg.sender == j.freelancer,"Escrow: not assigned freelancer");
        require(
            j.status == Status.PENDING || j.status == Status.DELIVERY,
            "Escrow: invalid status"
        );

        bool isLate = block.timestamp > j.deadline;
        if (isLate && !j.isLate) j.isLate = true;

        if (j.jobType == JobType.FIXED) {
            j.status = Status.DELIVERY;
            emit DeliveryMarked(jobId, 0, msg.sender, isLate);
        } else {
            Milestone[] storage ms = _milestones[jobId];
            require(milestoneIndex < ms.length, "Escrow: milestone OOB");
            require(!ms[milestoneIndex].confirmed, "Escrow: milestone already confirmed");
            ms[milestoneIndex].delivered = true;
            j.status = Status.DELIVERY;
            emit DeliveryMarked(jobId, milestoneIndex, msg.sender, isLate);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Client Confirmation
    // ─────────────────────────────────────────────────────────────────────────

    function confirmFixedJob(uint256 jobId) external {
        Job storage j = _jobs[jobId];
        require(j.exists,              "Escrow: job not found");
        require(j.jobType == JobType.FIXED, "Escrow: not fixed job");
        require(msg.sender == j.client,"Escrow: only client");
        require(j.funded,              "Escrow: not funded");
        require(
            j.status == Status.DELIVERY || j.status == Status.PENDING,
            "Escrow: not in delivery"
        );
        require(j.confirmedAmount == 0,"Escrow: already confirmed");

        j.confirmedAmount         = j.totalAmount;
        freelancerEarnings[jobId] = j.totalAmount;
        j.status                  = Status.CONFIRMED;

        emit FixedJobConfirmed(jobId, j.totalAmount);
    }

    function confirmMilestone(uint256 jobId, uint256 milestoneIndex) external {
        Job storage j = _jobs[jobId];
        require(j.exists,                   "Escrow: job not found");
        require(j.jobType == JobType.MILESTONE, "Escrow: not milestone job");
        require(msg.sender == j.client,     "Escrow: only client");
        require(j.funded,                   "Escrow: not funded");

        Milestone[] storage ms = _milestones[jobId];
        require(milestoneIndex < ms.length, "Escrow: milestone OOB");
        Milestone storage m = ms[milestoneIndex];
        require(!m.confirmed,  "Escrow: already confirmed");
        require(m.delivered,   "Escrow: not delivered");

        m.confirmed              = true;
        j.confirmedAmount       += m.amount;
        freelancerEarnings[jobId] += m.amount;

        // Check all-confirmed
        bool allDone = true;
        for (uint256 i = 0; i < ms.length; i++) {
            if (!ms[i].confirmed) { allDone = false; break; }
        }
        j.status = allDone ? Status.CONFIRMED : Status.PENDING;

        emit MilestoneConfirmed(jobId, milestoneIndex, m.amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Withdrawal System
    // ─────────────────────────────────────────────────────────────────────────

    function withdraw(uint256 jobId) external nonReentrant {
        Job storage j = _jobs[jobId];
        require(j.exists,              "Escrow: job not found");
        require(msg.sender == j.freelancer, "Escrow: not freelancer");
        require(
            j.status == Status.CONFIRMED ||
            j.status == Status.PENDING   ||
            j.status == Status.REFUNDED,
            "Escrow: cannot withdraw yet"
        );

        uint256 available = freelancerEarnings[jobId] - j.withdrawnAmount;
        require(available > 0, "Escrow: nothing to withdraw");

        (uint256 fee, bool isEarly) = _computeFee(jobId, available, j);

        uint256 net = available.calculateNet(fee);
        j.withdrawnAmount    += available;
        totalDaoFeesCollected += fee;

        if (isEarly) _markMilestonesWithdrawn(jobId);

        _safeSend(j.freelancer, net);
        emit WithdrawalMade(jobId, j.freelancer, net, fee, isEarly);
    }

    function batchWithdraw(uint256[] calldata jobIds) external nonReentrant {
        require(jobIds.length > 0,              "Escrow: empty list");
        require(jobIds.length <= MAX_BATCH_JOBS,"Escrow: batch too large");

        uint256 totalNet = 0;
        uint256 totalFee = 0;

        for (uint256 i = 0; i < jobIds.length; i++) {
            uint256 jobId = jobIds[i];
            Job storage j = _jobs[jobId];
            if (!j.exists)                    continue;
            if (msg.sender != j.freelancer)   continue;
            if (
                j.status != Status.CONFIRMED &&
                j.status != Status.PENDING
            )                                  continue;

            uint256 available = freelancerEarnings[jobId] - j.withdrawnAmount;
            if (available == 0)                continue;

            (uint256 fee, bool isEarly) = _computeFee(jobId, available, j);
            uint256 net = available.calculateNet(fee);

            j.withdrawnAmount += available;
            totalNet          += net;
            totalFee          += fee;

            if (isEarly) _markMilestonesWithdrawn(jobId);
            emit WithdrawalMade(jobId, j.freelancer, net, fee, isEarly);
        }

        require(totalNet > 0, "Escrow: nothing to withdraw");
        totalDaoFeesCollected += totalFee;
        _safeSend(msg.sender, totalNet);
        emit BatchWithdrawal(msg.sender, jobIds, totalNet, totalFee);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Refund / Cancel
    // ─────────────────────────────────────────────────────────────────────────

    function clientRequestRefund(uint256 jobId) external nonReentrant {
        Job storage j = _jobs[jobId];
        require(j.exists,                  "Escrow: job not found");
        require(msg.sender == j.client,    "Escrow: only client");
        require(j.jobType == JobType.MILESTONE, "Escrow: only milestone jobs");
        require(j.funded,                  "Escrow: not funded");
        require(
            j.status != Status.REFUNDED &&
            j.status != Status.CANCELLED,
            "Escrow: already finalised"
        );

        uint256 refundable = j.totalAmount - j.confirmedAmount;
        require(refundable > 0, "Escrow: nothing to refund");

        j.status = Status.REFUNDED;
        _safeSend(j.client, refundable);
        emit JobRefunded(jobId, refundable);
    }

    function cancelJob(uint256 jobId) external nonReentrant {
        Job storage j = _jobs[jobId];
        require(j.exists,              "Escrow: job not found");
        require(msg.sender == j.client,"Escrow: only client");
        require(j.status == Status.OPEN,"Escrow: can only cancel OPEN jobs");
        require(j.confirmedAmount == 0, "Escrow: work already confirmed");

        j.status = Status.CANCELLED;
        if (j.funded) {
            _safeSend(j.client, j.totalAmount);
            emit JobRefunded(jobId, j.totalAmount);
        }
        emit JobCancelled(jobId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  IEscrow - Dispute Integration
    // ─────────────────────────────────────────────────────────────────────────

    function notifyDisputeCreated(
        uint256 jobId,
        uint256 disputeId,
        DataTypes.DisputeReason reason
    ) external override {
        require(msg.sender == disputeContract, "Escrow: only dispute contract");
        Job storage j = _jobs[jobId];
        require(j.exists, "Escrow: job not found");

        j.status = Status.DISPUTED;

        if (reason == DataTypes.DisputeReason.LATE_DELIVERY && j.isLate) {
            j.lateDeliveryPenalty = true;
            emit LateDeliveryPenaltyApplied(jobId);
        }

        emit DisputeNotificationReceived(jobId, disputeId, reason);
    }

    function notifyDisputeResolved(
        uint256 jobId,
        uint256 disputeId,
        DataTypes.DisputeReason reason,
        address winner
    ) external override {
        require(msg.sender == disputeContract, "Escrow: only dispute contract");
        Job storage j = _jobs[jobId];
        require(j.exists, "Escrow: job not found");

        emit DisputeResolutionReceived(jobId, disputeId, reason, winner);

        if (reason == DataTypes.DisputeReason.LATE_DELIVERY) {
            j.status = Status.PENDING; // penalty already applied on creation
        }
        else if (reason == DataTypes.DisputeReason.REFUND_REQUEST) {
            if (j.jobType == JobType.FIXED) {
                if (winner == j.client) {
                    _executeClientRefund(j);
                } else {
                    _executeFreelancerWin(j, jobId);
                }
            }
            // Milestone refunds: client calls clientRequestRefund() directly
        }
        else if (
            reason == DataTypes.DisputeReason.QUALITY_ISSUE ||
            reason == DataTypes.DisputeReason.OTHER
        ) {
            if (winner == j.client) {
                _executeClientRefund(j);
            } else {
                if (j.jobType == JobType.FIXED) {
                    _executeFreelancerWin(j, jobId);
                } else {
                    // Confirm all delivered milestones
                    Milestone[] storage ms = _milestones[jobId];
                    for (uint256 i = 0; i < ms.length; i++) {
                        if (ms[i].delivered && !ms[i].confirmed) {
                            ms[i].confirmed        = true;
                            j.confirmedAmount     += ms[i].amount;
                            freelancerEarnings[jobId] += ms[i].amount;
                        }
                    }
                    j.status = Status.CONFIRMED;
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  View Helpers
    // ─────────────────────────────────────────────────────────────────────────

    function getJob(uint256 jobId) external view returns (Job memory) {
        require(_jobs[jobId].exists, "Escrow: job not found");
        return _jobs[jobId];
    }

    function getMilestones(uint256 jobId) external view returns (Milestone[] memory) {
        require(_jobs[jobId].exists,                  "Escrow: job not found");
        require(_jobs[jobId].jobType == JobType.MILESTONE, "Escrow: not milestone job");
        return _milestones[jobId];
    }

    function getMilestone(uint256 jobId, uint256 idx) external view returns (Milestone memory) {
        require(_jobs[jobId].exists,                  "Escrow: job not found");
        Milestone[] storage ms = _milestones[jobId];
        require(idx < ms.length, "Escrow: milestone OOB");
        return ms[idx];
    }

    function getAvailableWithdrawal(uint256 jobId) external view returns (uint256) {
        require(_jobs[jobId].exists, "Escrow: job not found");
        return freelancerEarnings[jobId] - _jobs[jobId].withdrawnAmount;
    }

    function getFreelancerJobs(address freelancer) external view returns (uint256[] memory) {
        return _freelancerJobIds[freelancer];
    }

    /// @notice Paginated list of all jobs.
    function getJobs(uint256 offset, uint256 limit) external view returns (Job[] memory page) {
        uint256 total = nextJobId - 1;
        if (offset >= total) return new Job[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        page = new Job[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = _jobs[i + 1];
        }
    }

    /// @notice Paginated jobs by client.
    function getJobsByClient(
        address client,
        uint256 offset,
        uint256 limit
    ) external view returns (Job[] memory page) {
        uint256 total = nextJobId - 1;
        // Count matching
        uint256 count = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (_jobs[i].exists && _jobs[i].client == client) count++;
        }
        if (offset >= count) return new Job[](0);
        uint256 end = offset + limit > count ? count : offset + limit;
        page = new Job[](end - offset);
        uint256 idx = 0;
        uint256 pageIdx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (!_jobs[i].exists || _jobs[i].client != client) continue;
            if (idx >= offset && pageIdx < page.length) {
                page[pageIdx++] = _jobs[i];
            }
            idx++;
            if (pageIdx == page.length) break;
        }
    }

    function isJobLate(uint256 jobId) external view returns (bool) {
        require(_jobs[jobId].exists, "Escrow: job not found");
        return _jobs[jobId].isLate;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Internal Helpers
    // ─────────────────────────────────────────────────────────────────────────

    function _computeFee(
        uint256 jobId,
        uint256 available,
        Job storage j
    ) internal view returns (uint256 fee, bool isEarlyWithdrawal) {
        if (j.jobType == JobType.FIXED) {
            fee = j.lateDeliveryPenalty
                ? available.calculateLateDeliveryFee()
                : available.calculateNormalFee();
            isEarlyWithdrawal = false;
        } else {
            Milestone[] storage ms = _milestones[jobId];
            bool allConfirmed = true;
            for (uint256 i = 0; i < ms.length; i++) {
                if (!ms[i].confirmed) { allConfirmed = false; break; }
            }
            if (allConfirmed || j.status == Status.REFUNDED) {
                fee = j.lateDeliveryPenalty
                    ? available.calculateLateDeliveryFee()
                    : available.calculateNormalFee();
                isEarlyWithdrawal = false;
            } else {
                fee               = available.calculateEarlyWithdrawalFee();
                isEarlyWithdrawal = true;
            }
        }
    }

    function _markMilestonesWithdrawn(uint256 jobId) internal {
        Milestone[] storage ms = _milestones[jobId];
        for (uint256 i = 0; i < ms.length; i++) {
            if (ms[i].confirmed && !ms[i].withdrawn) {
                ms[i].withdrawn  = true;
                ms[i].withdrawnAt = block.timestamp;
            }
        }
    }

    function _executeClientRefund(Job storage j) internal {
        uint256 refundable = j.totalAmount - j.confirmedAmount;
        if (refundable > 0) {
            j.status = Status.REFUNDED;
            _safeSend(j.client, refundable);
            emit JobRefunded(j.jobId, refundable);
        }
    }

    function _executeFreelancerWin(Job storage j, uint256 jobId) internal {
        j.confirmedAmount         = j.totalAmount;
        freelancerEarnings[jobId] = j.totalAmount;
        j.status                  = Status.CONFIRMED;
    }

    function _safeSend(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "Escrow: ETH transfer failed");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  UUPS
    // ─────────────────────────────────────────────────────────────────────────

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    receive() external payable {}
}