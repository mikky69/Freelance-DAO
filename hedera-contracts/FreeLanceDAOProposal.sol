// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @notice Minimal interface for your staking contract.
interface IFreeLanceDAOStaking {
    function stakes(address user) external view returns (uint256 amount, uint256 timestamp, uint256 rewards);
}

/**
 * @title FreeLanceDAOProposalContract (MVP extended)
 * @dev - Anyone can create proposals (MVP/testnet)
 *      - Weighted voting (weight = stake amount)
 *      - Voting power snapshotted on first vote
 *      - Quorum enforced as an absolute tokens threshold (quorumThresholdTokens)
 *      - Signalling only: no automatic execution
 *      - Proposal metadata expanded: type, category, tags, feePaid
 *      - Fees accumulate in contract for DAO treasury
 */
contract FreeLanceDAOProposalContract is Ownable, ReentrancyGuard {
    IFreeLanceDAOStaking public stakingContract;

    struct Proposal {
        address proposer;
        string title;
        string proposalType;
        string category;
        string description;
        string[] tags;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool finalized;
        uint256 feePaid; // in native token wei
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) private proposals;

    // per-proposal voting tracking
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public votingPowerSnapshot;

    // Track proposals by user
    mapping(address => uint256[]) private userProposals;

    // Governance parameters (MVP)
    uint256 public votingPeriod = 3 days;         // default voting period
    uint256 public quorumThresholdTokens = 1;     // default quorum threshold in token-units (sum of yes+no must >= this)

    /* ========== EVENTS ========== */
    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        string title,
        string proposalType,
        string category,
        uint256 deadline,
        uint256 feePaid
    );
    event VoteCast(uint256 indexed id, address indexed voter, uint256 weight, bool support);
    event ProposalFinalized(uint256 indexed id, bool approved);
    event VotingPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event QuorumThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event StakingContractUpdated(address indexed oldAddr, address indexed newAddr);
    event WithdrawnToTreasury(address indexed treasury, uint256 amount);

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
     * @param proposalType type string (e.g., "improvement", "grant", "governance")
     * @param category category string (e.g., "development", "marketing")
     * @param description longer description (IPFS link, etc.)
     * @param tags array of tags
     *
     * The function is payable and any sent native token amount will be recorded as `feePaid`.
     */
    function createProposal(
        string calldata title,
        string calldata proposalType,
        string calldata category,
        string calldata description,
        string[] calldata tags
    ) external payable nonReentrant returns (uint256) {
        // No proposer stake check for MVP (open proposals)
        proposalCount++;
        Proposal storage p = proposals[proposalCount];

        p.proposer = msg.sender;
        p.title = title;
        p.proposalType = proposalType;
        p.category = category;
        p.description = description;
        p.deadline = block.timestamp + votingPeriod;
        p.finalized = false;
        p.feePaid = msg.value; // record whatever the proposer sent

        // copy tags (calldata -> storage)
        for (uint256 i = 0; i < tags.length; i++) {
            p.tags.push(tags[i]);
        }

        // track by user for quick lookup
        userProposals[msg.sender].push(proposalCount);

        emit ProposalCreated(proposalCount, msg.sender, title, proposalType, category, p.deadline, p.feePaid);
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

    /* ========== TREASURY ========== */

    /**
     * @notice Withdraw contract balance to the DAO treasury address (owner only).
     * @param treasury payable address to receive funds
     */
    function withdrawToTreasury(address payable treasury) external onlyOwner nonReentrant {
        require(treasury != address(0), "Invalid treasury");
        uint256 bal = address(this).balance;
        require(bal > 0, "No balance");
        (bool sent, ) = treasury.call{value: bal}("");
        require(sent, "Transfer failed");
        emit WithdrawnToTreasury(treasury, bal);
    }

    /* ========== HELPERS / VIEWS ========== */

    /// @notice Returns staked amount for member from staking contract
    function stakingWeight(address member) public view returns (uint256) {
        (uint256 amount,,) = stakingContract.stakes(member);
        return amount;
    }

    /// @notice Get proposal summary (single)
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        string memory title,
        string memory proposalType,
        string memory category,
        string memory description,
        string[] memory tags,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 deadline,
        bool finalized,
        uint256 feePaid,
        uint256 participation
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.proposer,
            p.title,
            p.proposalType,
            p.category,
            p.description,
            p.tags,
            p.yesVotes,
            p.noVotes,
            p.deadline,
            p.finalized,
            p.feePaid,
            p.yesVotes + p.noVotes
        );
    }

    /// @notice Returns voter's snapshot for a proposal
    function getVoterSnapshot(uint256 proposalId, address voter) external view returns (uint256) {
        return votingPowerSnapshot[proposalId][voter];
    }

    /**
     * @notice Get all proposals metadata.
     * @dev Returns parallel arrays. tagsPerProposal is an array of string[] where each element corresponds to a proposal's tags.
     * WARNING: This can be expensive to call off-chain if there are many proposals. Consider adding pagination if needed.
     */
    function getAllProposals() external view returns (
        uint256[] memory ids,
        address[] memory proposers,
        string[] memory titles,
        string[] memory types_,
        string[] memory categories,
        string[] memory descriptions,
        string[][] memory tagsPerProposal,
        uint256[] memory fees,
        uint256[] memory deadlines,
        bool[] memory finalizedFlags,
        uint256[] memory participations
    ) {
        uint256 total = proposalCount;
        ids = new uint256[](total);
        proposers = new address[](total);
        titles = new string[](total);
        types_ = new string[](total);
        categories = new string[](total);
        descriptions = new string[](total);
        tagsPerProposal = new string[][](total);
        fees = new uint256[](total);
        deadlines = new uint256[](total);
        finalizedFlags = new bool[](total);
        participations = new uint256[](total);

        for (uint256 i = 0; i < total; i++) {
            uint256 pid = i + 1;
            Proposal storage p = proposals[pid];
            ids[i] = pid;
            proposers[i] = p.proposer;
            titles[i] = p.title;
            types_[i] = p.proposalType;
            categories[i] = p.category;
            descriptions[i] = p.description;
            deadlines[i] = p.deadline;
            finalizedFlags[i] = p.finalized;
            fees[i] = p.feePaid;
            participations[i] = p.yesVotes + p.noVotes;

            // copy tags
            uint256 tagCount = p.tags.length;
            string[] memory tagMem = new string[](tagCount);
            for (uint256 t = 0; t < tagCount; t++) {
                tagMem[t] = p.tags[t];
            }
            tagsPerProposal[i] = tagMem;
        }
        return (ids, proposers, titles, types_, categories, descriptions, tagsPerProposal, fees, deadlines, finalizedFlags, participations);
    }

    /**
     * @notice Get proposals created by a specific user (by address).
     * @dev Returns parallel arrays corresponding to that user's proposals.
     */
    function getUserProposals(address user) external view returns (
        uint256[] memory ids,
        string[] memory titles,
        string[] memory types_,
        string[] memory categories,
        string[] memory descriptions,
        string[][] memory tagsPerProposal,
        uint256[] memory fees,
        uint256[] memory deadlines,
        bool[] memory finalizedFlags,
        uint256[] memory participations
    ) {
        uint256 count = userProposals[user].length;
        ids = new uint256[](count);
        titles = new string[](count);
        types_ = new string[](count);
        categories = new string[](count);
        descriptions = new string[](count);
        tagsPerProposal = new string[][](count);
        fees = new uint256[](count);
        deadlines = new uint256[](count);
        finalizedFlags = new bool[](count);
        participations = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 pid = userProposals[user][i];
            Proposal storage p = proposals[pid];
            ids[i] = pid;
            titles[i] = p.title;
            types_[i] = p.proposalType;
            categories[i] = p.category;
            descriptions[i] = p.description;
            deadlines[i] = p.deadline;
            finalizedFlags[i] = p.finalized;
            fees[i] = p.feePaid;
            participations[i] = p.yesVotes + p.noVotes;

            // copy tags
            uint256 tagCount = p.tags.length;
            string[] memory tagMem = new string[](tagCount);
            for (uint256 t = 0; t < tagCount; t++) {
                tagMem[t] = p.tags[t];
            }
            tagsPerProposal[i] = tagMem;
        }

        return (ids, titles, types_, categories, descriptions, tagsPerProposal, fees, deadlines, finalizedFlags, participations);
    }

    /* ========== FALLBACKS ========== */

    // Allow contract to receive ETH/Hedera native token (createProposal handles fee recording)
    receive() external payable { }
    fallback() external payable { }
}