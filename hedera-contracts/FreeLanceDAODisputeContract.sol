// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title  Freelance DAO Dispute Resolution Contract
/// @author Kenechukwu
/// @notice Handles disputes between clients and freelancers through DAO voting.
/// @dev Linked to Escrow contract via jobId. DAO resolves, then Escrow executes payout/refund.

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FreelanceDAODisputeContract is Ownable, ReentrancyGuard {
    uint256 public nextDisputeId = 1;
    uint256 public quorum; // Minimum votes required (number of votes)
    mapping(address => bool) public daoMembers;

    enum DisputeStatus { OPEN, RESOLVED, REJECTED, PENDING_EXECUTION }

    struct Dispute {
        uint256 disputeId;
        uint256 jobId;          // Link to escrow job
        address client;
        address freelancer;
        string title;
        uint256 amount;
        string category;
        string description;
        uint256 votesForClient;
        uint256 votesForFreelancer;
        DisputeStatus status;
        address winner;
        bool exists;
    }

    // storage
    mapping(uint256 => Dispute) private disputes;
    mapping(uint256 => mapping(address => bool)) public disputeVotes;

    // index of disputes per user (client or freelancer)
    mapping(address => uint256[]) private disputeIdsByUser;

    // ====== EVENTS ======
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
        string description
    );
    event VoteCast(uint256 indexed disputeId, address indexed voter, string side);
    event DisputeResolved(uint256 indexed disputeId, address indexed winner, DisputeStatus status);

    // ====== CONSTRUCTOR ======
    // Note: OZ v5 Ownable expects initialOwner to be passed; we pass deployer (msg.sender)
    constructor(uint256 _quorum) Ownable(msg.sender) {
        require(_quorum > 0, "Quorum must be > 0");
        quorum = _quorum;
    }

    // ====== DAO ADMIN ======
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
        quorum = _newQuorum;
    }

    // ====== DISPUTE CREATION ======
    /**
     * @notice Create a dispute with metadata
     * @param jobId link to escrow job id
     * @param freelancer address of freelancer involved
     * @param title short title of dispute
     * @param amount value in wei under dispute
     * @param category category string
     * @param description longer description / evidence link
     */
    function createDispute(
        uint256 jobId,
        address freelancer,
        string calldata title,
        uint256 amount,
        string calldata category,
        string calldata description
    ) external returns (uint256) {
        require(freelancer != address(0), "Invalid freelancer");

        uint256 did = nextDisputeId++;
        Dispute storage d = disputes[did];
        d.disputeId = did;
        d.jobId = jobId;
        d.client = msg.sender; // client opens dispute
        d.freelancer = freelancer;
        d.title = title;
        d.amount = amount;
        d.category = category;
        d.description = description;
        d.status = DisputeStatus.OPEN;
        d.exists = true;

        // index for client and freelancer
        disputeIdsByUser[msg.sender].push(did);
        if (freelancer != msg.sender) {
            disputeIdsByUser[freelancer].push(did);
        }

        emit DisputeCreated(did, jobId, msg.sender, freelancer, title, amount, category, description);
        return did;
    }

    // ====== VOTING ======
    /**
     * @notice DAO members cast vote for client (true) or freelancer (false)
     * Resolution is triggered automatically when quorum is met
     */
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

        // trigger resolution when quorum reached (sum of votes)
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
            d.status = DisputeStatus.REJECTED; // tie -> rejected
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
            string memory title,
            uint256 amount,
            string memory category,
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
            d.title,
            d.amount,
            d.category,
            d.description,
            d.votesForClient,
            d.votesForFreelancer,
            d.status,
            d.winner
        );
    }

    /**
     * @notice Return metadata for all disputes (parallel arrays)
     * WARNING: can be expensive if many disputes exist — consider pagination.
     */
    function getAllDisputes()
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory titles,
            uint256[] memory amounts,
            string[] memory categories,
            address[] memory clients,
            address[] memory freelancers,
            DisputeStatus[] memory statuses,
            address[] memory winners
        )
    {
        uint256 total = nextDisputeId - 1;
        ids = new uint256[](total);
        titles = new string[](total);
        amounts = new uint256[](total);
        categories = new string[](total);
        clients = new address[](total);
        freelancers = new address[](total);
        statuses = new DisputeStatus[](total);
        winners = new address[](total);

        for (uint256 i = 0; i < total; i++) {
            uint256 did = i + 1;
            Dispute storage d = disputes[did];
            ids[i] = d.disputeId;
            titles[i] = d.title;
            amounts[i] = d.amount;
            categories[i] = d.category;
            clients[i] = d.client;
            freelancers[i] = d.freelancer;
            statuses[i] = d.status;
            winners[i] = d.winner;
        }

        return (ids, titles, amounts, categories, clients, freelancers, statuses, winners);
    }

    /**
     * @notice Return metadata for disputes involving a specific user (client or freelancer)
     */
    function getUserDisputes(address user)
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory titles,
            uint256[] memory amounts,
            string[] memory categories,
            address[] memory clients,
            address[] memory freelancers,
            DisputeStatus[] memory statuses,
            address[] memory winners
        )
    {
        uint256[] storage userIds = disputeIdsByUser[user];
        uint256 count = userIds.length;

        ids = new uint256[](count);
        titles = new string[](count);
        amounts = new uint256[](count);
        categories = new string[](count);
        clients = new address[](count);
        freelancers = new address[](count);
        statuses = new DisputeStatus[](count);
        winners = new address[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 did = userIds[i];
            Dispute storage d = disputes[did];
            ids[i] = d.disputeId;
            titles[i] = d.title;
            amounts[i] = d.amount;
            categories[i] = d.category;
            clients[i] = d.client;
            freelancers[i] = d.freelancer;
            statuses[i] = d.status;
            winners[i] = d.winner;
        }

        return (ids, titles, amounts, categories, clients, freelancers, statuses, winners);
    }
}