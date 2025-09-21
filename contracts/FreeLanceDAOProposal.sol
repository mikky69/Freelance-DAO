// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @notice Minimal interface for your staking contract.
interface IFreeLanceDAOStaking {
    function stakes(address user) external view returns (uint256 amount, uint256 timestamp, uint256 rewards);
}

/**
 * @title FreeLanceDAOProposalContract (MVP)
 * @dev - Anyone can create proposals (MVP/testnet)
 *      - Weighted voting (weight = stake amount)
 *      - Voting power snapshotted on first vote
 *      - Quorum enforced as an absolute tokens threshold (quorumThresholdTokens)
 *      - Signalling only: no automatic execution
 */
contract FreeLanceDAOProposalContract is Ownable, ReentrancyGuard {
    IFreeLanceDAOStaking public stakingContract;

    struct Proposal {
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool finalized;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) private proposals;

    // per-proposal voting tracking
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public votingPowerSnapshot;

    // Governance parameters (MVP)
    uint256 public votingPeriod = 3 days;         // default voting period
    uint256 public quorumThresholdTokens = 1;     // default quorum threshold in token-units (sum of yes+no must >= this)

    /* ========== EVENTS ========== */
    event ProposalCreated(uint256 indexed id, address indexed proposer, string title, uint256 deadline);
    event VoteCast(uint256 indexed id, address indexed voter, uint256 weight, bool support);
    event ProposalFinalized(uint256 indexed id, bool approved);
    event VotingPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event QuorumThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event StakingContractUpdated(address indexed oldAddr, address indexed newAddr);

    constructor(address _stakingContract) {
        require(_stakingContract != address(0), "Invalid staking contract");
        stakingContract = IFreeLanceDAOStaking(_stakingContract);
    }

    /* ========== ADMIN ========== */

    /// @notice Update staking contract address
    function setStakingContract(address _stakingContract) external onlyOwner {
        require(_stakingContract != address(0), "Invalid address");
        address old = address(stakingContract);
        stakingContract = IFreeLanceDAOStaking(_stakingContract);
        emit StakingContractUpdated(old, _stakingContract);
    }

    /// @notice Update voting period (seconds)
    function setVotingPeriod(uint256 _votingPeriod) external onlyOwner {
        require(_votingPeriod > 0, "Voting period > 0");
        uint256 old = votingPeriod;
        votingPeriod = _votingPeriod;
        emit VotingPeriodUpdated(old, _votingPeriod);
    }

    /// @notice Update quorum threshold (absolute token units)
    function setQuorumThresholdTokens(uint256 _threshold) external onlyOwner {
        uint256 old = quorumThresholdTokens;
        quorumThresholdTokens = _threshold;
        emit QuorumThresholdUpdated(old, _threshold);
    }

    /* ========== PROPOSAL CREATION (OPEN) ========== */

    /**
     * @notice Create a proposal. MVP: open to anyone.
     * @param title short title
     * @param description longer description (IPFS link, etc.)
     */
    function createProposal(string calldata title, string calldata description) external nonReentrant returns (uint256) {
        // No proposer stake check for MVP (open proposals)
        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.title = title;
        p.description = description;
        p.deadline = block.timestamp + votingPeriod;
        p.finalized = false;

        emit ProposalCreated(proposalCount, msg.sender, title, p.deadline);
        return proposalCount;
    }

    /* ========== VOTING ========== */

    /**
     * @notice Cast a weighted vote on a proposal.
     * @dev Snapshots voter's stake at time of first vote for this proposal.
     * @param proposalId id
     * @param support true = yes, false = no
     */
    function vote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage p = proposals[proposalId];
        require(p.deadline != 0, "Proposal does not exist");
        require(block.timestamp < p.deadline, "Voting has ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 currentStake = stakingWeight(msg.sender);
        require(currentStake > 0, "No stake to vote");

        // Snapshot voting power for this voter on this proposal
        votingPowerSnapshot[proposalId][msg.sender] = currentStake;
        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            p.yesVotes += currentStake;
        } else {
            p.noVotes += currentStake;
        }

        emit VoteCast(proposalId, msg.sender, currentStake, support);
    }

    /* ========== FINALIZE / TALLY ========== */

    /**
     * @notice Finalize the proposal (signalling only).
     * @dev quorum: (yes + no) >= quorumThresholdTokens.
     *      approved if yesVotes > noVotes and quorum met.
     */
    function finalizeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(p.deadline != 0, "Proposal does not exist");
        require(block.timestamp >= p.deadline, "Voting still active");
        require(!p.finalized, "Already finalized");

        p.finalized = true;

        uint256 participation = p.yesVotes + p.noVotes;
        bool approved = false;
        if (participation >= quorumThresholdTokens) {
            approved = (p.yesVotes > p.noVotes);
        } else {
            approved = false; // quorum not met -> fail
        }

        emit ProposalFinalized(proposalId, approved);
    }

    /* ========== HELPERS / VIEWS ========== */

    /// @notice Returns staked amount for member from staking contract
    function stakingWeight(address member) public view returns (uint256) {
        (uint256 amount,,) = stakingContract.stakes(member);
        return amount;
    }

    /// @notice Get proposal summary
    function getProposal(uint256 proposalId) external view returns (
        string memory title,
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 deadline,
        bool finalized,
        uint256 participation
    ) {
        Proposal storage p = proposals[proposalId];
        return (p.title, p.description, p.yesVotes, p.noVotes, p.deadline, p.finalized, p.yesVotes + p.noVotes);
    }

    /// @notice Get voter's snapshot for a proposal
    function getVoterSnapshot(uint256 proposalId, address voter) external view returns (uint256) {
        return votingPowerSnapshot[proposalId][voter];
    }
}