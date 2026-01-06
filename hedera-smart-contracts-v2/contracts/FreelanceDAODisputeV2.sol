// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title  Freelance DAO Dispute Resolution Contract V2
/// @author John Kenechukwu (Asmodeus)
/// @notice Handles disputes with typed reasons, communicates with escrow contract
/// @dev Implements IDisputeResolution interface

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IDisputeResolution} from "./interfaces/IDisputeResolution.sol";
import {IEscrow} from "./interfaces/IEscrow.sol";

contract FreelanceDAODisputeV2 is IDisputeResolution, Ownable, ReentrancyGuard {
    uint256 public nextDisputeId = 1;
    uint256 public quorum;
    uint256 public disputeCreationFee = 2 ether; // 2 HBAR
    address public escrowContract;
    address public daoTreasury;

    mapping(address => bool) public daoMembers;

    struct Dispute {
        uint256 disputeId;
        uint256 jobId;
        address client;
        address freelancer;
        string title;
        uint256 amount;
        string category;
        string description;
        DisputeReason reason;
        uint256 votesForClient;
        uint256 votesForFreelancer;
        DisputeStatus status;
        address winner;
        bool exists;
        uint256 createdAt;
    }

    mapping(uint256 => Dispute) private disputes;
    mapping(uint256 => mapping(address => bool)) public disputeVotes;
    mapping(address => uint256[]) private disputeIdsByUser;

    // Events
    event DaoMemberAdded(address indexed member);
    event DaoMemberRemoved(address indexed member);
    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed jobId,
        address indexed client,
        address freelancer,
        string title,
        uint256 amount,
        string category,
        string description,
        DisputeReason reason
    );
    event VoteCast(uint256 indexed disputeId, address indexed voter, string side);
    event DisputeResolved(uint256 indexed disputeId, address indexed winner, DisputeStatus status, DisputeReason reason);
    event DisputeExecuted(uint256 indexed disputeId);
    event QuorumUpdated(uint256 oldQuorum, uint256 newQuorum);
    event DisputeFeeUpdated(uint256 oldFee, uint256 newFee);
    event EscrowContractUpdated(address oldContract, address newContract);
    event DaoTreasuryUpdated(address oldTreasury, address newTreasury);

    constructor(uint256 _quorum, address _daoTreasury) Ownable(msg.sender) {
        require(_quorum > 0, "Quorum must be > 0");
        require(_daoTreasury != address(0), "Invalid treasury");
        quorum = _quorum;
        daoTreasury = _daoTreasury;
    }

    // ====== ADMIN ======

    function addDaoMember(address member) external onlyOwner {
        require(member != address(0), "Invalid member");
        require(!daoMembers[member], "Already a member");
        daoMembers[member] = true;
        emit DaoMemberAdded(member);
    }

    function removeDaoMember(address member) external onlyOwner {
        require(daoMembers[member], "Not a DAO member");
        daoMembers[member] = false;
        emit DaoMemberRemoved(member);
    }

    function setQuorum(uint256 _newQuorum) external onlyOwner {
        require(_newQuorum > 0, "Quorum must be > 0");
        emit QuorumUpdated(quorum, _newQuorum);
        quorum = _newQuorum;
    }

    function setDisputeCreationFee(uint256 _newFee) external onlyOwner {
        emit DisputeFeeUpdated(disputeCreationFee, _newFee);
        disputeCreationFee = _newFee;
    }

    function setEscrowContract(address _escrowContract) external onlyOwner {
        require(_escrowContract != address(0), "Invalid escrow");
        emit EscrowContractUpdated(escrowContract, _escrowContract);
        escrowContract = _escrowContract;
    }

    function setDaoTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury");
        emit DaoTreasuryUpdated(daoTreasury, _newTreasury);
        daoTreasury = _newTreasury;
    }

    // ====== DISPUTE CREATION ======

    /**
     * @notice Create a dispute with typed reason
     * @param jobId Link to escrow job id
     * @param freelancer Address of freelancer involved
     * @param title Short title of dispute
     * @param amount Value in wei under dispute
     * @param category Category string
     * @param description Longer description / evidence link
     * @param reason Type of dispute (LATE_DELIVERY, REFUND_REQUEST, QUALITY_ISSUE, OTHER)
     */
    function createDispute(
        uint256 jobId,
        address freelancer,
        string calldata title,
        uint256 amount,
        string calldata category,
        string calldata description,
        DisputeReason reason
    ) external payable returns (uint256) {
        require(msg.value >= disputeCreationFee, "Insufficient dispute fee");
        require(freelancer != address(0), "Invalid freelancer");
        require(escrowContract != address(0), "Escrow not set");

        uint256 did = nextDisputeId++;
        Dispute storage d = disputes[did];
        d.disputeId = did;
        d.jobId = jobId;
        d.client = msg.sender;
        d.freelancer = freelancer;
        d.title = title;
        d.amount = amount;
        d.category = category;
        d.description = description;
        d.reason = reason;
        d.status = DisputeStatus.OPEN;
        d.exists = true;
        d.createdAt = block.timestamp;

        disputeIdsByUser[msg.sender].push(did);
        if (freelancer != msg.sender) {
            disputeIdsByUser[freelancer].push(did);
        }

        // Send dispute fee to DAO treasury
        if (msg.value > 0) {
            (bool sent, ) = payable(daoTreasury).call{value: msg.value}("");
            require(sent, "Fee transfer failed");
        }

        // Notify escrow contract
        IEscrow(escrowContract).notifyDisputeCreated(jobId, did, IEscrow.DisputeReason(uint8(reason)));

        emit DisputeCreated(did, jobId, msg.sender, freelancer, title, amount, category, description, reason);
        return did;
    }

    // ====== VOTING ======

    /**
     * @notice DAO members vote on disputes requiring DAO resolution
     * @dev LATE_DELIVERY disputes don't require DAO vote (handled by smart contract)
     * @dev REFUND_REQUEST for milestone jobs don't require DAO vote (client can refund directly)
     * @param disputeId The dispute to vote on
     * @param voteForClient True to vote for client, false for freelancer
     */
    function voteOnDispute(uint256 disputeId, bool voteForClient) external nonReentrant {
        require(daoMembers[msg.sender], "Only DAO members can vote");

        Dispute storage d = disputes[disputeId];
        require(d.exists, "Dispute not found");
        require(d.status == DisputeStatus.OPEN, "Dispute closed");
        require(!disputeVotes[disputeId][msg.sender], "Already voted");

        // Check if this dispute type requires DAO voting
        require(_requiresDAOVote(d.reason), "This dispute type doesn't require DAO vote");

        disputeVotes[disputeId][msg.sender] = true;

        if (voteForClient) {
            d.votesForClient++;
            emit VoteCast(disputeId, msg.sender, "CLIENT");
        } else {
            d.votesForFreelancer++;
            emit VoteCast(disputeId, msg.sender, "FREELANCER");
        }

        // Trigger resolution when quorum reached
        if (d.votesForClient + d.votesForFreelancer >= quorum) {
            _resolveDispute(disputeId);
        }
    }

    /**
     * @notice Resolve disputes that don't require DAO vote (LATE_DELIVERY, milestone REFUND_REQUEST)
     * @dev Can be called by anyone after dispute is created
     * @param disputeId The dispute to auto-resolve
     */
    function autoResolveDispute(uint256 disputeId) external nonReentrant {
        Dispute storage d = disputes[disputeId];
        require(d.exists, "Dispute not found");
        require(d.status == DisputeStatus.OPEN, "Already resolved");
        require(!_requiresDAOVote(d.reason), "Requires DAO vote");

        // For LATE_DELIVERY: escrow contract already applied penalty when dispute was created
        // Winner doesn't matter here - just mark as resolved
        if (d.reason == DisputeReason.LATE_DELIVERY) {
            d.status = DisputeStatus.RESOLVED;
            d.winner = d.freelancer; // Freelancer still gets paid, just with penalty
        }

        emit DisputeResolved(disputeId, d.winner, d.status, d.reason);

        // Notify escrow
        IEscrow(escrowContract).notifyDisputeResolved(
            d.jobId,
            disputeId,
            IEscrow.DisputeReason(uint8(d.reason)),
            d.winner
        );
    }

    // ====== INTERNAL RESOLUTION ======

    function _resolveDispute(uint256 disputeId) internal {
        Dispute storage d = disputes[disputeId];
        require(d.status == DisputeStatus.OPEN, "Already resolved");

        if (d.votesForClient > d.votesForFreelancer) {
            d.status = DisputeStatus.RESOLVED;
            d.winner = d.client;
        } else if (d.votesForFreelancer > d.votesForClient) {
            d.status = DisputeStatus.RESOLVED;
            d.winner = d.freelancer;
        } else {
            d.status = DisputeStatus.REJECTED;
            d.winner = address(0);
        }

        emit DisputeResolved(disputeId, d.winner, d.status, d.reason);

        // Notify escrow contract of resolution
        if (d.status == DisputeStatus.RESOLVED) {
            IEscrow(escrowContract).notifyDisputeResolved(
                d.jobId,
                disputeId,
                IEscrow.DisputeReason(uint8(d.reason)),
                d.winner
            );
        }
    }

    /**
     * @notice Check if dispute type requires DAO voting
     * @param reason The dispute reason
     * @return bool True if requires DAO vote
     */
    function _requiresDAOVote(DisputeReason reason) internal pure returns (bool) {
        // LATE_DELIVERY doesn't require DAO vote (smart contract handles it)
        // REFUND_REQUEST for milestone jobs doesn't require DAO vote (client can refund directly)
        // REFUND_REQUEST for fixed jobs DOES require DAO vote
        // QUALITY_ISSUE requires DAO vote
        // OTHER requires DAO vote
        
        if (reason == DisputeReason.LATE_DELIVERY) {
            return false; // Smart contract auto-handles
        }
        
        // For REFUND_REQUEST, we can't determine job type here
        // So we allow DAO vote for fixed job refunds
        // Milestone refunds are handled via clientRequestRefund() in escrow
        
        return true; // REFUND_REQUEST (fixed), QUALITY_ISSUE, OTHER all need DAO
    }

    // ====== INTERFACE IMPLEMENTATION ======

    function getDisputeOutcome(uint256 disputeId)
        external
        view
        override
        returns (
            address winner,
            DisputeReason reason,
            DisputeStatus status
        )
    {
        Dispute storage d = disputes[disputeId];
        require(d.exists, "Dispute not found");
        return (d.winner, d.reason, d.status);
    }

    function markDisputeExecuted(uint256 disputeId) external override {
        require(msg.sender == escrowContract, "Only escrow");
        Dispute storage d = disputes[disputeId];
        require(d.exists, "Dispute not found");
        require(d.status == DisputeStatus.RESOLVED, "Not resolved");
        
        d.status = DisputeStatus.EXECUTED;
        emit DisputeExecuted(disputeId);
    }

    // ====== VIEW HELPERS ======

    function getDispute(uint256 disputeId)
        external
        view
        returns (Dispute memory)
    {
        Dispute storage d = disputes[disputeId];
        require(d.exists, "Dispute not found");
        return d;
    }

    function getAllDisputes() external view returns (Dispute[] memory) {
        uint256 total = nextDisputeId - 1;
        Dispute[] memory allDisputes = new Dispute[](total);

        for (uint256 i = 0; i < total; i++) {
            uint256 did = i + 1;
            allDisputes[i] = disputes[did];
        }

        return allDisputes;
    }

    function getUserDisputes(address user) external view returns (Dispute[] memory) {
        uint256[] storage userIds = disputeIdsByUser[user];
        uint256 count = userIds.length;
        Dispute[] memory userDisputes = new Dispute[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 did = userIds[i];
            userDisputes[i] = disputes[did];
        }

        return userDisputes;
    }

    function requiresDAOVote(DisputeReason reason) external pure returns (bool) {
        return _requiresDAOVote(reason);
    }

    function getDisputesByReason(DisputeReason reason) external view returns (Dispute[] memory) {
        uint256 count = 0;
        
        // First pass: count matching disputes
        for (uint256 i = 1; i < nextDisputeId; i++) {
            if (disputes[i].exists && disputes[i].reason == reason) {
                count++;
            }
        }

        // Second pass: populate array
        Dispute[] memory result = new Dispute[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextDisputeId; i++) {
            if (disputes[i].exists && disputes[i].reason == reason) {
                result[index++] = disputes[i];
            }
        }

        return result;
    }

    function getOpenDisputes() external view returns (Dispute[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextDisputeId; i++) {
            if (disputes[i].exists && disputes[i].status == DisputeStatus.OPEN) {
                count++;
            }
        }

        Dispute[] memory result = new Dispute[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextDisputeId; i++) {
            if (disputes[i].exists && disputes[i].status == DisputeStatus.OPEN) {
                result[index++] = disputes[i];
            }
        }

        return result;
    }

    receive() external payable {}
}