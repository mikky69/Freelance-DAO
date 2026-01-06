// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title  FreeLance DAO Escrow V2 (Fixed + Milestone jobs)
/// @author John Kenechukwu (Asmodeus)
/// @notice Upgraded escrow with withdrawal-based fees, deadline tracking, and dispute integration
/// @dev Implements IEscrow interface for dispute contract communication

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IEscrow} from "./interfaces/IEscrow.sol";
import {IDisputeResolution} from "./interfaces/IDisputeResolution.sol";
import {FeeCalculator} from "./libraries/FeeCalculator.sol";

contract FreelanceDAOEscrowV2 is IEscrow, Ownable, ReentrancyGuard {
    using FeeCalculator for uint256;

    address public daoTreasury;
    address public disputeContract;
    uint256 public totalDaoFeesCollected;
    uint256 public nextJobId = 1;

    enum JobType { FIXED, MILESTONE }
    enum Status { 
        OPEN,           // Job posted, accepting requests
        PENDING,        // Freelancer assigned, work in progress
        DELIVERY,       // Freelancer marked delivery
        CONFIRMED,      // Client confirmed, payment ready for withdrawal
        DISPUTED,       // Job is disputed
        REFUNDED,       // Job refunded to client
        CANCELLED       // Job cancelled
    }

    struct Milestone {
        uint256 amount;
        bool confirmed;         // Client confirmed this milestone
        bool delivered;         // Freelancer marked delivered
        bool withdrawn;         // Freelancer withdrew this milestone
        uint256 withdrawnAt;    // Timestamp of withdrawal (0 if not withdrawn)
    }

    struct Job {
        uint256 jobId;
        JobType jobType;
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 minimumBudget;
        uint256 maximumBudget;
        uint256 confirmedAmount;    // Amount confirmed by client (ready for withdrawal)
        uint256 withdrawnAmount;    // Amount already withdrawn by freelancer
        uint256 createdAt;
        uint256 deadline;           // Job deadline timestamp
        Status status;
        bool funded;
        bool lateDeliveryPenalty;   // True if late delivery dispute filed
        bool isLate;                // True if delivered after deadline
        Milestone[] milestones;
        string jobTitle;
        string jobCategory;
        string projectDescription;
        string[] requiredSkills;
        string projectDuration;
        bool exists;
    }

    struct JobParams {
        string jobTitle;
        string jobCategory;
        string projectDescription;
        string[] requiredSkills;
        string projectDuration;
        uint256 minimumBudget;
        uint256 maximumBudget;
        uint256 deadline;           // Deadline timestamp
    }

    mapping(uint256 => Job) private jobs;
    mapping(address => mapping(uint256 => bool)) public requested;
    
    // Track freelancer earnings per job (before withdrawal)
    mapping(uint256 => uint256) public freelancerEarnings;
    
    // Track which jobs a freelancer can withdraw from (for batch withdrawal)
    mapping(address => uint256[]) private freelancerJobIds;

    // Events
    event JobCreated(uint256 indexed jobId, JobType jobType, address indexed client, uint256 totalAmount, uint256 deadline);
    event JobFunded(uint256 indexed jobId, uint256 amount);
    event ProviderRequested(uint256 indexed jobId, address indexed provider);
    event ProviderApproved(uint256 indexed jobId, address indexed provider);
    event DeliveryMarked(uint256 indexed jobId, uint256 indexed milestoneIndex, address indexed provider, bool isLate);
    event MilestoneConfirmed(uint256 indexed jobId, uint256 indexed milestoneIndex, uint256 amount);
    event FixedJobConfirmed(uint256 indexed jobId, uint256 amount);
    event WithdrawalMade(uint256 indexed jobId, address indexed freelancer, uint256 amountNet, uint256 fee, bool isEarlyWithdrawal);
    event BatchWithdrawal(address indexed freelancer, uint256[] jobIds, uint256 totalNet, uint256 totalFee);
    event JobRefunded(uint256 indexed jobId, uint256 refundedAmount);
    event JobCancelled(uint256 indexed jobId);
    event DaoTreasuryUpdated(address oldTreasury, address newTreasury);
    event DisputeContractUpdated(address oldContract, address newContract);
    event WithdrawDaoFees(address to, uint256 amount);
    event DisputeNotificationReceived(uint256 indexed jobId, uint256 indexed disputeId, DisputeReason reason);
    event DisputeResolutionReceived(uint256 indexed jobId, uint256 indexed disputeId, DisputeReason reason, address winner);
    event LateDeliveryPenaltyApplied(uint256 indexed jobId);

    constructor(address _daoTreasury, address _owner) Ownable(_owner) {
        require(_daoTreasury != address(0), "Invalid DAO treasury");
        daoTreasury = _daoTreasury;
    }

    // ====== ADMIN ======
    
    function setDaoTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "zero address");
        emit DaoTreasuryUpdated(daoTreasury, _newTreasury);
        daoTreasury = _newTreasury;
    }

    function setDisputeContract(address _disputeContract) external onlyOwner {
        require(_disputeContract != address(0), "zero address");
        emit DisputeContractUpdated(disputeContract, _disputeContract);
        disputeContract = _disputeContract;
    }

    function withdrawDaoFees(uint256 amount) external nonReentrant onlyOwner {
        require(amount > 0, "zero amount");
        require(amount <= totalDaoFeesCollected, "Insufficient fees");
        totalDaoFeesCollected -= amount;
        _safeSend(daoTreasury, amount);
        emit WithdrawDaoFees(daoTreasury, amount);
    }

    // ====== JOB CREATION & FUNDING ======

    function createFixedJob(JobParams calldata params) external payable returns (uint256) {
        require(msg.value > 0, "Must fund job > 0");
        require(bytes(params.jobTitle).length > 0, "Title required");
        require(bytes(params.projectDescription).length > 0, "Description required");
        require(params.deadline > block.timestamp, "Deadline must be future");

        uint256 jid = nextJobId++;
        Job storage j = jobs[jid];
        j.jobId = jid;
        j.jobType = JobType.FIXED;
        j.client = msg.sender;
        j.jobTitle = params.jobTitle;
        j.jobCategory = params.jobCategory;
        j.projectDescription = params.projectDescription;
        j.requiredSkills = params.requiredSkills;
        j.projectDuration = params.projectDuration;
        j.totalAmount = msg.value;
        j.minimumBudget = params.minimumBudget > 0 ? params.minimumBudget : msg.value;
        j.maximumBudget = params.maximumBudget > 0 ? params.maximumBudget : msg.value;
        j.confirmedAmount = 0;
        j.withdrawnAmount = 0;
        j.createdAt = block.timestamp;
        j.deadline = params.deadline;
        j.status = Status.OPEN;
        j.funded = true;
        j.exists = true;

        emit JobCreated(jid, JobType.FIXED, msg.sender, j.totalAmount, params.deadline);
        emit JobFunded(jid, msg.value);
        return jid;
    }

    function createMilestoneJob(
        uint256[] calldata milestoneAmounts, 
        JobParams calldata params
    ) external payable returns (uint256) {
        require(milestoneAmounts.length > 0, "Need >=1 milestone");
        require(bytes(params.jobTitle).length > 0, "Title required");
        require(bytes(params.projectDescription).length > 0, "Description required");
        require(params.deadline > block.timestamp, "Deadline must be future");

        uint256 sum = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneAmounts[i] > 0, "Milestone > 0");
            sum += milestoneAmounts[i];
        }

        uint256 jid = nextJobId++;
        Job storage j = jobs[jid];
        j.jobId = jid;
        j.jobType = JobType.MILESTONE;
        j.client = msg.sender;
        j.jobTitle = params.jobTitle;
        j.jobCategory = params.jobCategory;
        j.projectDescription = params.projectDescription;
        j.requiredSkills = params.requiredSkills;
        j.projectDuration = params.projectDuration;
        j.minimumBudget = sum;
        j.maximumBudget = sum;
        j.totalAmount = sum;
        j.confirmedAmount = 0;
        j.withdrawnAmount = 0;
        j.createdAt = block.timestamp;
        j.deadline = params.deadline;
        j.status = Status.OPEN;
        j.exists = true;
        j.funded = false;

        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            j.milestones.push(Milestone({ 
                amount: milestoneAmounts[i], 
                confirmed: false, 
                delivered: false,
                withdrawn: false,
                withdrawnAt: 0
            }));
        }

        if (msg.value > 0) {
            require(msg.value == sum, "msg.value must equal total");
            j.funded = true;
            emit JobFunded(jid, msg.value);
        }

        emit JobCreated(jid, JobType.MILESTONE, msg.sender, j.totalAmount, params.deadline);
        return jid;
    }

    function fundJob(uint256 jobId) external payable nonReentrant {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender == j.client, "Only client can fund");
        require(!j.funded, "Already funded");
        require(msg.value > 0, "Must send > 0");
        require(msg.value == j.totalAmount, "Must send full amount");
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
        
        // Add to freelancer's job list
        freelancerJobIds[provider].push(jobId);
        
        emit ProviderApproved(jobId, provider);
    }

    // ====== DELIVERY FLOW ======

    function markDelivery(uint256 jobId, uint256 milestoneIndex) external {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender == j.freelancer, "Not assigned freelancer");
        require(j.status == Status.PENDING || j.status == Status.DELIVERY, "Invalid status");
        
        bool isLate = block.timestamp > j.deadline;
        
        if (j.jobType == JobType.FIXED) {
            j.status = Status.DELIVERY;
            if (isLate && !j.isLate) {
                j.isLate = true;
            }
            emit DeliveryMarked(jobId, 0, msg.sender, isLate);
        } else {
            require(milestoneIndex < j.milestones.length, "Milestone OOB");
            Milestone storage m = j.milestones[milestoneIndex];
            require(!m.confirmed, "Already confirmed");
            m.delivered = true;
            j.status = Status.DELIVERY;
            if (isLate && !j.isLate) {
                j.isLate = true;
            }
            emit DeliveryMarked(jobId, milestoneIndex, msg.sender, isLate);
        }
    }

    // ====== CLIENT CONFIRMATION ======

    function confirmFixedJob(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(j.jobType == JobType.FIXED, "Not fixed job");
        require(msg.sender == j.client, "Only client");
        require(j.funded, "Job not funded");
        require(j.status == Status.DELIVERY || j.status == Status.PENDING, "Not in delivery");
        require(j.confirmedAmount == 0, "Already confirmed");

        j.confirmedAmount = j.totalAmount;
        freelancerEarnings[jobId] = j.totalAmount;
        j.status = Status.CONFIRMED;

        emit FixedJobConfirmed(jobId, j.totalAmount);
    }

    function confirmMilestone(uint256 jobId, uint256 milestoneIndex) external {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(j.jobType == JobType.MILESTONE, "Not milestone job");
        require(msg.sender == j.client, "Only client");
        require(j.funded, "Not funded");
        require(milestoneIndex < j.milestones.length, "Milestone OOB");

        Milestone storage m = j.milestones[milestoneIndex];
        require(!m.confirmed, "Already confirmed");
        require(m.delivered, "Not marked delivered");

        m.confirmed = true;
        j.confirmedAmount += m.amount;
        freelancerEarnings[jobId] += m.amount;

        // Check if all milestones confirmed
        bool allConfirmed = true;
        for (uint256 i = 0; i < j.milestones.length; i++) {
            if (!j.milestones[i].confirmed) {
                allConfirmed = false;
                break;
            }
        }
        if (allConfirmed) {
            j.status = Status.CONFIRMED;
        } else {
            j.status = Status.PENDING;
        }

        emit MilestoneConfirmed(jobId, milestoneIndex, m.amount);
    }

    // ====== WITHDRAWAL SYSTEM ======

    /// @notice Freelancer withdraws earnings from a single job
    /// @param jobId The job to withdraw from
    function withdraw(uint256 jobId) external nonReentrant {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender == j.freelancer, "Not freelancer");
        require(j.status == Status.CONFIRMED || j.status == Status.PENDING || j.status == Status.REFUNDED, "Cannot withdraw yet");
        
        uint256 availableAmount = freelancerEarnings[jobId] - j.withdrawnAmount;
        require(availableAmount > 0, "Nothing to withdraw");

        uint256 fee;
        bool isEarlyWithdrawal = false;

        if (j.jobType == JobType.FIXED) {
            // Fixed job: apply 5% or 7% based on late delivery penalty
            if (j.lateDeliveryPenalty) {
                fee = availableAmount.calculateLateDeliveryFee();
            } else {
                fee = availableAmount.calculateNormalFee();
            }
        } else {
            // Milestone job: check if this is early withdrawal
            bool allConfirmed = true;
            for (uint256 i = 0; i < j.milestones.length; i++) {
                if (!j.milestones[i].confirmed) {
                    allConfirmed = false;
                    break;
                }
            }

            if (allConfirmed || j.status == Status.REFUNDED) {
                // All milestones confirmed, final withdrawal - apply 5% or 7%
                if (j.lateDeliveryPenalty) {
                    fee = availableAmount.calculateLateDeliveryFee();
                } else {
                    fee = availableAmount.calculateNormalFee();
                }
            } else {
                // Early withdrawal - apply 10%
                fee = availableAmount.calculateEarlyWithdrawalFee();
                isEarlyWithdrawal = true;
                
                // Mark withdrawn milestones
                for (uint256 i = 0; i < j.milestones.length; i++) {
                    if (j.milestones[i].confirmed && !j.milestones[i].withdrawn) {
                        j.milestones[i].withdrawn = true;
                        j.milestones[i].withdrawnAt = block.timestamp;
                    }
                }
            }
        }

        uint256 net = availableAmount.calculateNet(fee);
        
        // Update state before transfers
        j.withdrawnAmount += availableAmount;
        totalDaoFeesCollected += fee;

        // Transfer
        _safeSend(j.freelancer, net);

        emit WithdrawalMade(jobId, j.freelancer, net, fee, isEarlyWithdrawal);
    }

    /// @notice Batch withdraw from multiple jobs to save gas
    /// @param jobIds Array of job IDs to withdraw from
    function batchWithdraw(uint256[] calldata jobIds) external nonReentrant {
        require(jobIds.length > 0, "No jobs provided");
        
        uint256 totalNet = 0;
        uint256 totalFee = 0;

        for (uint256 i = 0; i < jobIds.length; i++) {
            uint256 jobId = jobIds[i];
            Job storage j = jobs[jobId];
            
            require(j.exists, "Job not exist");
            require(msg.sender == j.freelancer, "Not freelancer");
            require(j.status == Status.CONFIRMED || j.status == Status.PENDING, "Cannot withdraw");
            
            uint256 availableAmount = freelancerEarnings[jobId] - j.withdrawnAmount;
            if (availableAmount == 0) continue;

            uint256 fee;
            bool isEarlyWithdrawal = false;

            if (j.jobType == JobType.FIXED) {
                if (j.lateDeliveryPenalty) {
                    fee = availableAmount.calculateLateDeliveryFee();
                } else {
                    fee = availableAmount.calculateNormalFee();
                }
            } else {
                bool allConfirmed = true;
                for (uint256 m = 0; m < j.milestones.length; m++) {
                    if (!j.milestones[m].confirmed) {
                        allConfirmed = false;
                        break;
                    }
                }

                if (allConfirmed) {
                    if (j.lateDeliveryPenalty) {
                        fee = availableAmount.calculateLateDeliveryFee();
                    } else {
                        fee = availableAmount.calculateNormalFee();
                    }
                } else {
                    fee = availableAmount.calculateEarlyWithdrawalFee();
                    isEarlyWithdrawal = true;
                    
                    for (uint256 m = 0; m < j.milestones.length; m++) {
                        if (j.milestones[m].confirmed && !j.milestones[m].withdrawn) {
                            j.milestones[m].withdrawn = true;
                            j.milestones[m].withdrawnAt = block.timestamp;
                        }
                    }
                }
            }

            uint256 net = availableAmount.calculateNet(fee);
            
            j.withdrawnAmount += availableAmount;
            totalNet += net;
            totalFee += fee;

            emit WithdrawalMade(jobId, j.freelancer, net, fee, isEarlyWithdrawal);
        }

        require(totalNet > 0, "Nothing to withdraw");
        
        totalDaoFeesCollected += totalFee;
        _safeSend(msg.sender, totalNet);

        emit BatchWithdrawal(msg.sender, jobIds, totalNet, totalFee);
    }

    // ====== CLIENT REFUND REQUEST ======

    /// @notice Client requests refund for remaining milestones (milestone jobs only)
    /// @dev Freelancer gets paid 5% fee for completed milestones (not their fault)
    function clientRequestRefund(uint256 jobId) external nonReentrant {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender == j.client, "Only client");
        require(j.jobType == JobType.MILESTONE, "Only milestone jobs");
        require(j.funded, "Job not funded");
        require(j.status != Status.REFUNDED && j.status != Status.CANCELLED, "Already final");

        // Calculate refundable amount (unconfirmed milestones)
        uint256 refundAmount = j.totalAmount - j.confirmedAmount;
        require(refundAmount > 0, "Nothing to refund");

        // If freelancer has confirmed milestones but hasn't withdrawn, allow 5% fee withdrawal
        // This is handled automatically when freelancer calls withdraw() - no penalty
        
        j.status = Status.REFUNDED;
        
        // Refund client
        _safeSend(j.client, refundAmount);
        
        emit JobRefunded(jobId, refundAmount);
    }

    /// @notice Cancel job before work starts (only for OPEN status)
    function cancelJob(uint256 jobId) external nonReentrant {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(msg.sender == j.client, "Only client");
        require(j.status == Status.OPEN, "Cannot cancel now");
        require(j.confirmedAmount == 0, "Already has confirmed work");

        j.status = Status.CANCELLED;
        
        uint256 refund = 0;
        if (j.funded) {
            refund = j.totalAmount;
            _safeSend(j.client, refund);
        }
        
        emit JobCancelled(jobId);
        if (refund > 0) emit JobRefunded(jobId, refund);
    }

    // ====== DISPUTE INTEGRATION ======

    /// @notice Called by Dispute contract when dispute is created
    function notifyDisputeCreated(
        uint256 jobId,
        uint256 disputeId,
        DisputeReason reason
    ) external override {
        require(msg.sender == disputeContract, "Only dispute contract");
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        
        j.status = Status.DISPUTED;
        
        // If late delivery dispute and job is actually late, apply penalty flag
        if (reason == DisputeReason.LATE_DELIVERY && j.isLate) {
            j.lateDeliveryPenalty = true;
            emit LateDeliveryPenaltyApplied(jobId);
        }
        
        emit DisputeNotificationReceived(jobId, disputeId, reason);
    }

    /// @notice Called by Dispute contract when dispute is resolved
    function notifyDisputeResolved(
        uint256 jobId,
        uint256 disputeId,
        DisputeReason reason,
        address winner
    ) external override {
        require(msg.sender == disputeContract, "Only dispute contract");
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        
        emit DisputeResolutionReceived(jobId, disputeId, reason, winner);
        
        // Handle based on dispute reason
        if (reason == DisputeReason.LATE_DELIVERY) {
            // Late delivery penalty already applied in notifyDisputeCreated
            // Just restore status
            j.status = Status.PENDING;
        } 
        else if (reason == DisputeReason.REFUND_REQUEST) {
            // For fixed jobs, DAO voted - execute refund if client won
            if (j.jobType == JobType.FIXED) {
                if (winner == j.client) {
                    uint256 refundAmount = j.totalAmount - j.confirmedAmount;
                    if (refundAmount > 0) {
                        j.status = Status.REFUNDED;
                        _safeSend(j.client, refundAmount);
                        emit JobRefunded(jobId, refundAmount);
                    }
                } else {
                    // Freelancer won - mark as confirmed
                    j.confirmedAmount = j.totalAmount;
                    freelancerEarnings[jobId] = j.totalAmount;
                    j.status = Status.CONFIRMED;
                }
            }
            // Milestone refunds are handled by clientRequestRefund() - no DAO vote needed
        }
        else if (reason == DisputeReason.QUALITY_ISSUE) {
            // DAO decided quality issue
            if (winner == j.client) {
                // Client wins - refund remaining
                uint256 refundAmount = j.totalAmount - j.confirmedAmount;
                if (refundAmount > 0) {
                    j.status = Status.REFUNDED;
                    _safeSend(j.client, refundAmount);
                    emit JobRefunded(jobId, refundAmount);
                }
            } else {
                // Freelancer wins - mark remaining as confirmed
                if (j.jobType == JobType.FIXED) {
                    j.confirmedAmount = j.totalAmount;
                    freelancerEarnings[jobId] = j.totalAmount;
                    j.status = Status.CONFIRMED;
                } else {
                    // For milestones, confirm all delivered milestones
                    for (uint256 i = 0; i < j.milestones.length; i++) {
                        if (j.milestones[i].delivered && !j.milestones[i].confirmed) {
                            j.milestones[i].confirmed = true;
                            j.confirmedAmount += j.milestones[i].amount;
                            freelancerEarnings[jobId] += j.milestones[i].amount;
                        }
                    }
                    j.status = Status.CONFIRMED;
                }
            }
        }
    }

    // ====== VIEW HELPERS ======

    function getJob(uint256 jobId) external view returns (Job memory) {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        return Job({
            jobId: j.jobId,
            jobType: j.jobType,
            client: j.client,
            freelancer: j.freelancer,
            totalAmount: j.totalAmount,
            minimumBudget: j.minimumBudget,
            maximumBudget: j.maximumBudget,
            confirmedAmount: j.confirmedAmount,
            withdrawnAmount: j.withdrawnAmount,
            createdAt: j.createdAt,
            deadline: j.deadline,
            status: j.status,
            funded: j.funded,
            lateDeliveryPenalty: j.lateDeliveryPenalty,
            isLate: j.isLate,
            milestones: new Milestone[](0),
            jobTitle: j.jobTitle,
            jobCategory: j.jobCategory,
            projectDescription: j.projectDescription,
            requiredSkills: j.requiredSkills,
            projectDuration: j.projectDuration,
            exists: j.exists
        });
    }

    function getMilestone(uint256 jobId, uint256 idx) 
        external 
        view 
        returns (
            uint256 amount, 
            bool confirmed, 
            bool delivered,
            bool withdrawn,
            uint256 withdrawnAt
        ) 
    {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(j.jobType == JobType.MILESTONE, "Not milestone job");
        require(idx < j.milestones.length, "OOB");
        Milestone storage m = j.milestones[idx];
        return (m.amount, m.confirmed, m.delivered, m.withdrawn, m.withdrawnAt);
    }

    function getFreelancerJobs(address freelancer) external view returns (uint256[] memory) {
        return freelancerJobIds[freelancer];
    }

    function getAvailableWithdrawal(uint256 jobId) external view returns (uint256) {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        return freelancerEarnings[jobId] - j.withdrawnAmount;
    }

    function getMilestonesForJob(uint256 jobId) 
        external 
        view 
        returns (Milestone[] memory) 
    {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        require(j.jobType == JobType.MILESTONE, "Not a milestone job");
        return j.milestones;
    }

    function getJobsByClient(address client) external view returns (Job[] memory) {
        Job[] memory clientJobs = new Job[](nextJobId - 1);
        uint256 count = 0;
        for (uint256 i = 1; i < nextJobId; i++) {
            if (jobs[i].exists && jobs[i].client == client) {
                clientJobs[count++] = jobs[i];
            }
        }
        assembly { mstore(clientJobs, count) }
        return clientJobs;
    }

    function getAllJobs() external view returns (Job[] memory) {
        Job[] memory allJobs = new Job[](nextJobId - 1);
        for (uint256 i = 1; i < nextJobId; i++) {
            if (jobs[i].exists) {
                allJobs[i-1] = jobs[i];
            }
        }
        return allJobs;
    }

    function isJobLate(uint256 jobId) external view returns (bool) {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not exist");
        return j.isLate;
    }

    // ====== INTERNAL ======

    function _safeSend(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = payable(to).call{ value: amount }("");
        require(ok, "Transfer failed");
    }

    receive() external payable {}
}