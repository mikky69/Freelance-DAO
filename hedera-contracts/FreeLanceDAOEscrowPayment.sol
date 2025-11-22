// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title  FreeLance DAO Escrow (Fixed + Milestone jobs)
/// @author John Kenechukwu
/// @notice Secure escrow contract where clients create jobs and fund the DAO escrow.
///         Freelancers request/are approved, deliver, and are paid when client confirms.
///         A DAO fee (default 5%) is taken once per job and deducted from the last milestone.
/// @dev Use Ownable for escrow admin actions. ReentrancyGuard prevents reentrancy attacks.

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract FreeLanceDAOEscrowPayment is Ownable, ReentrancyGuard {
    uint256 public constant PCT_BASE = 100; // percent base (use 5 => 5%)
    uint256 public daoFeePct;               // DAO fee percentage
    uint256 public totalDaoFeesCollected;   // Total fees collected and available for withdrawal
    address public daoTreasury;             // where fees are withdrawn to
    uint256 public nextJobId = 1;

        enum JobType { FIXED, MILESTONE }
    enum Status { OPEN, PENDING, DELIVERY, CONFIRMED, DISPUTED, REFUNDED, CANCELLED }

    constructor(address _daoTreasury, uint256 _daoFeePct, address _owner) Ownable(_owner) {
        require(_daoTreasury != address(0), "Invalid DAO treasury");
        require(_daoFeePct <= 100, "Fee pct invalid");
        daoTreasury = _daoTreasury;
        daoFeePct = _daoFeePct;
    }

    struct Milestone {
        uint256 amount;
        bool released;
        bool delivered; // whether freelancer marked delivered for this milestone
    }

    struct Job {
        uint256 jobId;
        JobType jobType;
        address client;
        address freelancer; // awarded provider
        uint256 totalAmount; // sum of milestone amounts or fixed amount
        uint256 minimumBudget;
        uint256 maximumBudget;
        uint256 releasedAmount; // how much already paid out to freelancer
        uint256 createdAt;
        Status status;
        bool funded;
        Milestone[] milestones; // empty for FIXED
        string jobTitle;
        string jobCategory;
        string projectDescription;
        string[] requiredSkills;
        // budgetType is implicitly handled by JobType (FIXED/MILESTONE)
        // Will store the user-facing duration string.
        string projectDuration;
        bool confirmed; // whether job fully confirmed
        bool exists;
        bool feeTaken; // whether DAO fee has been taken for this job
    }

    struct JobParams {
        string jobTitle;
        string jobCategory;
        string projectDescription;
        string[] requiredSkills;
        string projectDuration;
        uint256 minimumBudget;
        uint256 maximumBudget;
    }

    // job storage
    mapping(uint256 => Job) private jobs;

    // provider requests: provider => jobId => requested
    mapping(address => mapping(uint256 => bool)) public requested;

    // Events
    event JobCreated(uint256 indexed jobId, JobType jobType, address indexed client, uint256 totalAmount);
    event JobFunded(uint256 indexed jobId, uint256 amount);
    event ProviderRequested(uint256 indexed jobId, address indexed provider);
    event ProviderApproved(uint256 indexed jobId, address indexed provider);
    event DeliveryMarked(uint256 indexed jobId, uint256 indexed milestoneIndex, address indexed provider);
    event MilestoneReleased(uint256 indexed jobId, uint256 indexed milestoneIndex, uint256 amountNet, uint256 daoFee);
    event FixedJobReleased(uint256 indexed jobId, uint256 amountNet, uint256 daoFee);
    event JobRefunded(uint256 indexed jobId, uint256 refundedAmount);
    event JobCancelled(uint256 indexed jobId);
    event DaoFeePctUpdated(uint256 oldPct, uint256 newPct);
    event DaoTreasuryUpdated(address oldTreasury, address newTreasury);
    event WithdrawDaoFees(address to, uint256 amount);

    // ====== ADMIN ======
    function setDaoFeePct(uint256 _newPct) external onlyOwner {
        require(_newPct <= 100, "Pct >100");
        emit DaoFeePctUpdated(daoFeePct, _newPct);
        daoFeePct = _newPct;
    }

    function setDaoTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "zero address");
        emit DaoTreasuryUpdated(daoTreasury, _newTreasury);
        daoTreasury = _newTreasury;
    }

    // Allow admin to refund a job (for disputes, emergencies)
    function adminRefundJob(uint256 jobId) external nonReentrant onlyOwner {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(j.status != Status.REFUNDED && j.status != Status.CANCELLED && !j.confirmed, "Already final");

        // compute remaining refundable amount = totalAmount - releasedAmount
        uint256 refundable = j.totalAmount - j.releasedAmount;
        if (refundable > 0) {
            _safeSend(j.client, refundable);
        }
        j.status = Status.REFUNDED;
        emit JobRefunded(jobId, refundable);
    }

    // Withdraw accumulated DAO fees from contract to daoTreasury
    // Note: DAO fees are not tracked separately on-chain as a variable but are simply held in contract balance until withdrawn.
    function withdrawDaoFees(uint256 amount) external nonReentrant onlyOwner {
        require(amount > 0, "zero amount");
        require(amount <= totalDaoFeesCollected, "Insufficient fees");
        totalDaoFeesCollected -= amount;
        _safeSend(daoTreasury, amount);
        emit WithdrawDaoFees(daoTreasury, amount); // Event name is plural, but that's okay.
    }

    // ====== JOB CREATION & FUNDING ======

    /// @notice Create a fixed job and optionally fund it by sending value
    function createFixedJob(JobParams calldata params) external payable returns (uint256) {
        require(msg.value > 0, "Must fund job > 0");
        require(bytes(params.jobTitle).length > 0, "Title required");
        require(bytes(params.projectDescription).length > 0, "Description required");

        uint256 jid = nextJobId++;
        Job storage j = jobs[jid];
        j.jobId = jid;
        j.jobType = JobType.FIXED;
        j.client = msg.sender;
        j.jobTitle = params.jobTitle;
        j.jobCategory = params.jobCategory;
        j.projectDescription = params.projectDescription;
        // Manually copy calldata array to storage to avoid compiler error
        string[] memory skills = params.requiredSkills;
        j.requiredSkills = skills;
        j.projectDuration = params.projectDuration;
        j.totalAmount = msg.value;
        j.releasedAmount = 0;
        j.createdAt = block.timestamp;
        j.status = Status.OPEN;
        j.funded = true;
        j.exists = true;

        j.minimumBudget = params.minimumBudget > 0 ? params.minimumBudget : msg.value;
        j.maximumBudget = params.maximumBudget > 0 ? params.maximumBudget : msg.value;

        emit JobCreated(jid, JobType.FIXED, msg.sender, j.totalAmount);
        emit JobFunded(jid, msg.value);
        return jid;
    }

    /// @notice Create milestone job. Provide milestoneAmounts; you may fund total by sending msg.value equal to sum
    /// @dev IMPORTANT: The last milestone amount MUST be >= daoFeePct% of totalAmount. This ensures the DAO fee can be deducted from the last milestone.
    function createMilestoneJob(
        uint256[] calldata milestoneAmounts, JobParams calldata params
    ) external payable returns (uint256) {
        require(milestoneAmounts.length > 0, "Need >=1 milestone");
        uint256 sum = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneAmounts[i] > 0, "Milestone > 0");
            sum += milestoneAmounts[i];
        }
        uint256 fee = (sum * daoFeePct) / PCT_BASE;
        require(milestoneAmounts[milestoneAmounts.length - 1] >= fee, "Last milestone must cover DAO fee");
        require(bytes(params.jobTitle).length > 0, "Title required");
        require(bytes(params.projectDescription).length > 0, "Description required");

        uint256 jid = nextJobId++;
        Job storage j = jobs[jid];
        j.jobId = jid;
        j.jobType = JobType.MILESTONE;
        j.client = msg.sender;
        j.jobTitle = params.jobTitle;
        j.jobCategory = params.jobCategory;
        j.projectDescription = params.projectDescription;
        // Manually copy calldata array to storage to avoid compiler error
        string[] memory skills = params.requiredSkills;
        j.requiredSkills = skills;
        j.projectDuration = params.projectDuration;
        j.minimumBudget = sum; // For milestones, min/max budget is the total sum
        j.maximumBudget = sum;
        j.totalAmount = sum;
        j.releasedAmount = 0;
        j.createdAt = block.timestamp;
        j.status = Status.OPEN;
        j.exists = true;
        j.funded = false;

        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            j.milestones.push(Milestone({ amount: milestoneAmounts[i], released: false, delivered: false }));
        }

        // Optionally accept funding on creation (must fund full sum)
        if (msg.value > 0) {
            require(msg.value == sum, "msg.value must equal total milestone sum");
            j.funded = true;
            emit JobFunded(jid, msg.value);
        }

        emit JobCreated(jid, JobType.MILESTONE, msg.sender, j.totalAmount);
        return jid;
    }

    /// @notice Fund an existing job (useful for create-then-fund pattern)
    function fundJob(uint256 jobId) external payable nonReentrant {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender == j.client, "Only client can fund");
        require(!j.funded, "Already funded");
        require(msg.value > 0, "Must send > 0");
        require(msg.value == j.totalAmount, "Must send full job amount");
        j.funded = true;
        emit JobFunded(jobId, msg.value);
    }

    // ====== REQUEST / APPROVE PROVIDER ======

    function requestJob(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender != j.client, "Client cannot request");
        require(j.status == Status.OPEN, "Job not open");
        requested[msg.sender][jobId] = true;
        emit ProviderRequested(jobId, msg.sender);
    }

    function approveProvider(uint256 jobId, address provider) external {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender == j.client, "Only client can approve");
        require(j.status == Status.OPEN, "Job not open");
        require(requested[provider][jobId], "Provider did not request");
        j.freelancer = provider;
        j.status = Status.PENDING;
        emit ProviderApproved(jobId, provider);
    }

    // ====== DELIVERY FLOW ======

    /// @notice Freelancer marks delivery. For milestone jobs, they mark a particular milestone as delivered.
    function markDelivery(uint256 jobId, uint256 milestoneIndex) external {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender == j.freelancer, "Not awarded provider");
        require(j.status == Status.PENDING || j.status == Status.DELIVERY, "Invalid status");
        if (j.jobType == JobType.FIXED) {
            // For fixed job, ignore milestoneIndex
            j.status = Status.DELIVERY;
            emit DeliveryMarked(jobId, 0, msg.sender);
            return;
        } else {
            // milestone job
            require(milestoneIndex < j.milestones.length, "Milestone OOB");
            Milestone storage m = j.milestones[milestoneIndex];
            require(!m.released, "Milestone already released");
            m.delivered = true;
            j.status = Status.DELIVERY;
            emit DeliveryMarked(jobId, milestoneIndex, msg.sender);
            return;
        }
    }

    // ====== CLIENT CONFIRMATION / RELEASE ======

    /// @notice Client confirms delivery. For fixed job, this releases full job amount (minus DAO fee) to freelancer.
    /// For milestone job, calling confirmMilestoneRelease will attempt to release specified milestone to freelancer.
    function confirmFixedJob(uint256 jobId) external nonReentrant {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(j.jobType == JobType.FIXED, "Not fixed job");
        require(msg.sender == j.client, "Only client");
        require(j.funded, "Job not funded");
        require(j.status == Status.DELIVERY || j.status == Status.PENDING, "Not in delivery");
        require(!j.confirmed, "Already confirmed");

        // Calculate DAO fee: fee is totalAmount * daoFeePct / 100
        uint256 fee = (j.totalAmount * daoFeePct) / PCT_BASE;
        uint256 net = j.totalAmount - fee;

        // mark as released before external calls
        j.releasedAmount = j.totalAmount;
        j.confirmed = true;
        j.status = Status.CONFIRMED;
        j.feeTaken = true;
        totalDaoFeesCollected += fee;

        // transfer net to freelancer, fee to daoTreasury
        if (net > 0) _safeSend(j.freelancer, net);
        if (fee > 0) _safeSend(daoTreasury, fee);

        emit FixedJobReleased(jobId, net, fee);
    }

    /// @notice Client releases a milestone (client triggers payout for given milestone index).
    /// The last milestone will have the DAO fee deducted (fee = totalAmount * daoFeePct / 100).
    function releaseMilestone(uint256 jobId, uint256 milestoneIndex) external nonReentrant {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(j.jobType == JobType.MILESTONE, "Not milestone job");
        require(msg.sender == j.client, "Only client");
        require(j.funded, "Not funded");
        require(milestoneIndex < j.milestones.length, "Milestone OOB");

        Milestone storage m = j.milestones[milestoneIndex];
        require(!m.released, "Already released");
        require(m.delivered, "Freelancer not marked delivered for this milestone");

        uint256 amount = m.amount;
        uint256 daoFee = 0;
        uint256 net = amount;

        // If this is the last milestone, deduct the DAO fee (based on totalAmount)
        if (milestoneIndex == j.milestones.length - 1) {
            require(!j.feeTaken, "Fee already taken");
            daoFee = (j.totalAmount * daoFeePct) / PCT_BASE;
            require(amount >= daoFee, "Last milestone must cover DAO fee (enforced at creation)");
            net = amount - daoFee;
            j.feeTaken = true;
            totalDaoFeesCollected += daoFee;
        }

        // Mark released before transfers
        m.released = true;
        j.releasedAmount += amount;
        j.status = Status.PENDING; // Default status, will be updated if all are released

        // If all milestones released -> mark confirmed
        bool allReleased = true;
        for (uint256 i = 0; i < j.milestones.length; i++) {
            if (!j.milestones[i].released) {
                allReleased = false;
                break;
            }
        }
        if (allReleased) {
            j.confirmed = true;
            j.status = Status.CONFIRMED;
        }

        // Pay freelancer (net) and DAO fee (if any)
        if (net > 0) _safeSend(j.freelancer, net);
        if (daoFee > 0) _safeSend(daoTreasury, daoFee);

        emit MilestoneReleased(jobId, milestoneIndex, net, daoFee);
    }

    // ====== CANCEL / DISPUTE ======

    /// @notice Client cancels job before funding or before provider approved. Refunds any funded amount.
    function cancelJob(uint256 jobId) external nonReentrant {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender == j.client, "Only client");
        require(j.status == Status.OPEN, "Cannot cancel now");
        // If some amount already released, cannot cancel (use dispute/adminRefund)
        require(j.releasedAmount == 0, "Already released partially");

        uint256 refund = 0;
        j.status = Status.CANCELLED; // State change BEFORE external call

        if (j.funded) {
            refund = j.totalAmount;
            _safeSend(j.client, refund);
        }
        emit JobCancelled(jobId);
        if (refund > 0) emit JobRefunded(jobId, refund);
    }

    /// @notice Freelancer or client can mark dispute — moves job to DISPUTED; admin can then refund or resolve
    function markDisputed(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender == j.client || msg.sender == j.freelancer, "Only parties");
        j.status = Status.DISPUTED;
        // Off-chain arbitration or owner/admin action required
    }

    // ====== VIEW HELPERS ======

    function getJobSummary(uint256 jobId)
        external
        view
        returns (
            uint256 jobIdOut,
            JobType jobType,
            address client,
            address freelancer,
            uint256 totalAmount,
            uint256 releasedAmount,
            Status status,
            uint256 createdAt,
            bool funded,
            bool confirmed
        )
    {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        return (
            j.jobId,
            j.jobType,
            j.client,
            j.freelancer,
            j.totalAmount,
            j.releasedAmount,
            j.status,
            j.createdAt,
            j.funded,
            j.confirmed
        );
    }

    function getJobDetails(uint256 jobId)
        external
        view
        returns (
            string memory jobTitle,
            string memory jobCategory,
            string memory projectDescription,
            string[] memory requiredSkills,
            string memory projectDuration,
            uint256 minimumBudget,
            uint256 maximumBudget
        )
    {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        return (
            j.jobTitle,
            j.jobCategory,
            j.projectDescription,
            j.requiredSkills,
            j.projectDuration,
            j.minimumBudget,
            j.maximumBudget
        );
    }

    function getMilestone(uint256 jobId, uint256 idx) external view returns (uint256 amount, bool released, bool delivered) {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(j.jobType == JobType.MILESTONE, "Not milestone job");
        require(idx < j.milestones.length, "OOB");
        Milestone storage m = j.milestones[idx];
        return (m.amount, m.released, m.delivered);
    }

    // ====== INTERNAL ======

    function _safeSend(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = payable(to).call{ value: amount }("");
        require(ok, "Transfer failed");
    }

    // Enable contract to receive funds (rarely used except accidental sends)
    receive() external payable {}
    fallback() external payable {}
}