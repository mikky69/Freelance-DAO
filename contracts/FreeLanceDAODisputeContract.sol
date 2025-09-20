// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title  Freelance DAO Dispute Resolution Contract
/// @author Kenechukwu
/// @notice Handles disputes between clients and freelancers through DAO voting.
/// @dev Linked to Escrow contract via jobId. DAO resolves, then Escrow executes payout/refund.

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FreelanceDAODisputeContract is Ownable, ReentrancyGuard {
    uint256 public nextDisputeId = 1;
    uint256 public quorum; // Minimum votes required
    mapping(address => bool) public daoMembers;

    enum DisputeStatus { OPEN, RESOLVED, REJECTED, PENDING_EXECUTION }

    struct Dispute {
        uint256 disputeId;
        uint256 jobId;          // Link to escrow job
        address client;
        address freelancer;
        string description;
        uint256 votesForClient;
        uint256 votesForFreelancer;
        DisputeStatus status;
        address winner;
        bool exists;
    }

    mapping(uint256 => Dispute) private disputes;
    mapping(uint256 => mapping(address => bool)) public disputeVotes;

    // ====== EVENTS ======
    event DaoMemberAdded(address indexed member);
    event DaoMemberRemoved(address indexed member);
    event DisputeCreated(uint256 indexed disputeId, uint256 indexed jobId, address indexed client, address freelancer, string description);
    event VoteCast(uint256 indexed disputeId, address indexed voter, string side);
    event DisputeResolved(uint256 indexed disputeId, address indexed winner, DisputeStatus status);

    // ====== CONSTRUCTOR ======
    constructor(uint256 _quorum) Ownable(msg.sender) {
        require(_quorum > 0, "Quorum must be > 0");
        quorum = _quorum;
    }

    // ====== DAO ADMIN ======
    function addDaoMember(address member) external onlyOwner {
        require(member != address(0), "Invalid member");
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
        quorum = _newQuorum;
    }

    // ====== DISPUTE CREATION ======
    function createDispute(uint256 jobId, address freelancer, string calldata description) external returns (uint256) {
        require(freelancer != address(0), "Invalid freelancer");

        uint256 did = nextDisputeId++;
        Dispute storage d = disputes[did];
        d.disputeId = did;
        d.jobId = jobId;
        d.client = msg.sender; // client opens dispute
        d.freelancer = freelancer;
        d.description = description;
        d.status = DisputeStatus.OPEN;
        d.exists = true;

        emit DisputeCreated(did, jobId, msg.sender, freelancer, description);
        return did;
    }

    // ====== VOTING ======
    function voteOnDispute(uint256 disputeId, bool voteForClient) external nonReentrant {
        require(daoMembers[msg.sender], "Only DAO members can vote");

        Dispute storage d = disputes[disputeId];
        require(d.exists, "Dispute not found");
        require(d.status == DisputeStatus.OPEN, "Dispute closed");
        require(!disputeVotes[disputeId][msg.sender], "Already voted");

        disputeVotes[disputeId][msg.sender] = true;

        if (voteForClient) {
            d.votesForClient++;
            emit VoteCast(disputeId, msg.sender, "CLIENT");
        } else {
            d.votesForFreelancer++;
            emit VoteCast(disputeId, msg.sender, "FREELANCER");
        }

        if (d.votesForClient + d.votesForFreelancer >= quorum) {
            _resolveDispute(disputeId);
        }
    }

    // ====== INTERNAL RESOLUTION ======
    function _resolveDispute(uint256 disputeId) internal {
        Dispute storage d = disputes[disputeId];
        require(d.status == DisputeStatus.OPEN, "Already resolved");

        if (d.votesForClient > d.votesForFreelancer) {
            d.status = DisputeStatus.PENDING_EXECUTION;
            d.winner = d.client;
        } else if (d.votesForFreelancer > d.votesForClient) {
            d.status = DisputeStatus.PENDING_EXECUTION;
            d.winner = d.freelancer;
        } else {
            d.status = DisputeStatus.REJECTED; // tie
            d.winner = address(0);
        }

        emit DisputeResolved(disputeId, d.winner, d.status);
    }

    // ====== VIEW HELPERS ======
    function getDispute(uint256 disputeId) 
        external 
        view 
        returns (
            uint256 id,
            uint256 jobId,
            address client,
            address freelancer,
            string memory description,
            uint256 votesForClient,
            uint256 votesForFreelancer,
            DisputeStatus status,
            address winner
        ) 
    {
        Dispute storage d = disputes[disputeId];
        require(d.exists, "Dispute not found");
        return (
            d.disputeId,
            d.jobId,
            d.client,
            d.freelancer,
            d.description,
            d.votesForClient,
            d.votesForFreelancer,
            d.status,
            d.winner
        );
    }
}