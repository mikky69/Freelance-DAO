import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployMockFeed,
  deployStaking,
  deployProposals,
  usdToEthWei,
} from "../helpers/fixtures";

// ProposalTier enum values
const MINOR = 0;
const MAJOR = 1;

describe("FreelanceDAOProposals — Unit Tests", function () {
  async function setup() {
    const [owner, treasury, alice, bob, carol] = await ethers.getSigners();
    const treasuryAddr = await treasury.getAddress();
    const feed      = await deployMockFeed();
    const staking   = await deployStaking(feed, treasuryAddr, owner);
    const proposals = await deployProposals(staking, feed, treasuryAddr, owner);

    // Wire staking → proposals
    await staking.connect(owner).setProposalsContract(await proposals.getAddress());

    return { proposals, staking, feed, owner, treasury, alice, bob, carol, treasuryAddr };
  }

  // ── Initialization ──────────────────────────────────────────────────────────
  describe("Initialization", function () {
    it("sets correct staking contract reference", async function () {
      const { proposals, staking } = await loadFixture(setup);
      expect(await proposals.stakingContractAddress()).to.equal(await staking.getAddress());
    });

    it("has correct default voting period (3 days)", async function () {
      const { proposals } = await loadFixture(setup);
      expect(await proposals.votingPeriod()).to.equal(3 * 24 * 3600);
    });
  });

  // ── Proposal Creation — MINOR ───────────────────────────────────────────────
  describe("createProposal() — MINOR tier", function () {
    it("allows user with $1 staked to create MINOR proposal", async function () {
      const { proposals, staking, alice } = await loadFixture(setup);
      await staking.connect(alice).stake({ value: usdToEthWei(2) });

      await expect(
        proposals.connect(alice).createProposal(MINOR, "Improve UI", "dev", "Description", [])
      ).to.emit(proposals, "ProposalCreated");
    });

    it("rejects MINOR proposal from user with no stake", async function () {
      const { proposals, bob } = await loadFixture(setup);
      await expect(
        proposals.connect(bob).createProposal(MINOR, "Test", "dev", "Desc", [])
      ).to.be.revertedWith("Proposals: MINOR requires >= $1 USD staked");
    });

    it("records proposal correctly", async function () {
      const { proposals, staking, alice } = await loadFixture(setup);
      await staking.connect(alice).stake({ value: usdToEthWei(5) });
      await proposals.connect(alice).createProposal(MINOR, "My Proposal", "dev", "Full description", ["tag1"]);

      const p = await proposals.getProposal(1n);
      expect(p.title).to.equal("My Proposal");
      expect(p.tier).to.equal(MINOR);
      expect(p.proposer).to.equal(await alice.getAddress());
      expect(p.finalized).to.be.false;
    });
  });

  // ── Proposal Creation — MAJOR ───────────────────────────────────────────────
  describe("createProposal() — MAJOR tier", function () {
    it("allows user with $100+ staked to create MAJOR proposal", async function () {
      const { proposals, staking, alice } = await loadFixture(setup);
      // Stake $110 worth of ETH
      await staking.connect(alice).stake({ value: usdToEthWei(110) });

      await expect(
        proposals.connect(alice).createProposal(MAJOR, "Protocol Upgrade", "governance", "Upgrade the fee model", [])
      ).to.emit(proposals, "ProposalCreated").withArgs(
        1n, await alice.getAddress(), MAJOR, "Protocol Upgrade", "governance",
        (v: bigint) => v > 0n, // deadline check
        0n // no fee
      );
    });

    it("rejects MAJOR proposal from user with $99 staked (below threshold)", async function () {
      const { proposals, staking, bob } = await loadFixture(setup);
      await staking.connect(bob).stake({ value: usdToEthWei(99) });

      await expect(
        proposals.connect(bob).createProposal(MAJOR, "Big Proposal", "governance", "Desc", [])
      ).to.be.revertedWith("Proposals: MAJOR requires >= $100 USD staked");
    });

    it("user with exactly $100 staked can create MAJOR proposal", async function () {
      const { proposals, staking, alice } = await loadFixture(setup);
      await staking.connect(alice).stake({ value: usdToEthWei(100) });
      await expect(
        proposals.connect(alice).createProposal(MAJOR, "Exact Threshold", "governance", "Desc", [])
      ).to.emit(proposals, "ProposalCreated");
    });
  });

  // ── canCreate helpers ────────────────────────────────────────────────────────
  describe("canCreateMajorProposal() / canCreateMinorProposal()", function () {
    it("returns false for major when staked < $100", async function () {
      const { proposals, staking, alice } = await loadFixture(setup);
      await staking.connect(alice).stake({ value: usdToEthWei(50) });
      const [canMajor] = await proposals.canCreateMajorProposal(await alice.getAddress());
      expect(canMajor).to.be.false;
    });

    it("returns true for major when staked >= $100", async function () {
      const { proposals, staking, alice } = await loadFixture(setup);
      await staking.connect(alice).stake({ value: usdToEthWei(100) });
      const [canMajor] = await proposals.canCreateMajorProposal(await alice.getAddress());
      expect(canMajor).to.be.true;
    });

    it("returns true for minor when staked >= $1", async function () {
      const { proposals, staking, alice } = await loadFixture(setup);
      await staking.connect(alice).stake({ value: usdToEthWei(2) });
      const [canMinor] = await proposals.canCreateMinorProposal(await alice.getAddress());
      expect(canMinor).to.be.true;
    });
  });

  // ── Voting ───────────────────────────────────────────────────────────────────
  describe("vote()", function () {
    async function setupWithProposal() {
      const ctx = await setup();
      const { proposals, staking, alice, bob } = ctx;
      await staking.connect(alice).stake({ value: usdToEthWei(10) });
      await staking.connect(bob).stake({ value: usdToEthWei(5) });
      await proposals.connect(alice).createProposal(MINOR, "Proposal", "cat", "desc", []);
      return { ...ctx, proposalId: 1n };
    }

    it("allows staker to vote yes", async function () {
      const { proposals, alice, proposalId } = await loadFixture(setupWithProposal);
      await expect(proposals.connect(alice).vote(proposalId, true))
        .to.emit(proposals, "VoteCast")
        .withArgs(proposalId, await alice.getAddress(), usdToEthWei(10), true);
    });

    it("snapshots voting power at time of vote", async function () {
      const { proposals, alice, staking, proposalId } = await loadFixture(setupWithProposal);
      const stakedAtVote = usdToEthWei(10);
      await proposals.connect(alice).vote(proposalId, true);
      const snapshot = await proposals.getVoterSnapshot(proposalId, await alice.getAddress());
      expect(snapshot).to.equal(stakedAtVote);
    });

    it("rejects double voting", async function () {
      const { proposals, alice, proposalId } = await loadFixture(setupWithProposal);
      await proposals.connect(alice).vote(proposalId, true);
      await expect(proposals.connect(alice).vote(proposalId, true))
        .to.be.revertedWith("Proposals: already voted");
    });

    it("rejects vote from user with no stake", async function () {
      const { proposals, carol, proposalId } = await loadFixture(setupWithProposal);
      await expect(proposals.connect(carol).vote(proposalId, true))
        .to.be.revertedWith("Proposals: no stake - cannot vote");
    });

    it("rejects vote after deadline", async function () {
      const { proposals, bob, proposalId } = await loadFixture(setupWithProposal);
      await time.increase(4 * 24 * 3600); // 4 days — past 3 day deadline
      await expect(proposals.connect(bob).vote(proposalId, true))
        .to.be.revertedWith("Proposals: voting ended");
    });

    it("weighted voting accumulates correctly", async function () {
      const { proposals, alice, bob, proposalId } = await loadFixture(setupWithProposal);
      await proposals.connect(alice).vote(proposalId, true);  // weight = $10 in wei
      await proposals.connect(bob).vote(proposalId, false);   // weight = $5 in wei

      const p = await proposals.getProposal(proposalId);
      expect(p.yesVotes).to.equal(usdToEthWei(10));
      expect(p.noVotes).to.equal(usdToEthWei(5));
    });
  });

  // ── Finalization ─────────────────────────────────────────────────────────────
  describe("finalizeProposal()", function () {
    async function setupVoted() {
      const ctx = await setup();
      const { proposals, staking, alice, bob } = ctx;
      await staking.connect(alice).stake({ value: usdToEthWei(10) });
      await staking.connect(bob).stake({ value: usdToEthWei(5) });
      await proposals.connect(alice).createProposal(MINOR, "Proposal", "cat", "desc", []);
      await proposals.connect(alice).vote(1n, true);
      await proposals.connect(bob).vote(1n, false);
      return { ...ctx };
    }

    it("reverts finalization before deadline", async function () {
      const { proposals } = await loadFixture(setupVoted);
      await expect(proposals.finalizeProposal(1n))
        .to.be.revertedWith("Proposals: voting still active");
    });

    it("finalizes approved when yesVotes > noVotes", async function () {
      const { proposals } = await loadFixture(setupVoted);
      await time.increase(3 * 24 * 3600 + 1);
      await expect(proposals.finalizeProposal(1n))
        .to.emit(proposals, "ProposalFinalized")
        .withArgs(1n, true, usdToEthWei(10), usdToEthWei(5));
    });

    it("reverts double finalization", async function () {
      const { proposals } = await loadFixture(setupVoted);
      await time.increase(3 * 24 * 3600 + 1);
      await proposals.finalizeProposal(1n);
      await expect(proposals.finalizeProposal(1n))
        .to.be.revertedWith("Proposals: already finalized");
    });
  });

  // ── onStakeChanged (bidirectional) ──────────────────────────────────────────
  describe("onStakeChanged() — Staking → Proposals notification", function () {
    it("emits StakeChangedNotified when staking contract notifies", async function () {
      const { proposals, staking, alice } = await loadFixture(setup);
      const amount = usdToEthWei(5);
      await expect(staking.connect(alice).stake({ value: amount }))
        .to.emit(proposals, "StakeChangedNotified")
        .withArgs(await alice.getAddress(), amount);
    });

    it("emits StakeChangedNotified on unstake", async function () {
      const { proposals, staking, alice } = await loadFixture(setup);
      const amount = usdToEthWei(10);
      await staking.connect(alice).stake({ value: amount });
      const half = amount / 2n;
      await expect(staking.connect(alice).unstake(half))
        .to.emit(proposals, "StakeChangedNotified")
        .withArgs(await alice.getAddress(), half);
    });

    it("reverts if called by non-staking address", async function () {
      const { proposals, alice } = await loadFixture(setup);
      await expect(
        proposals.connect(alice).onStakeChanged(await alice.getAddress(), 100n)
      ).to.be.revertedWith("Proposals: caller not staking contract");
    });
  });

  // ── Pagination ───────────────────────────────────────────────────────────────
  describe("getProposals() pagination", function () {
    it("returns paginated proposals", async function () {
      const { proposals, staking, alice } = await loadFixture(setup);
      await staking.connect(alice).stake({ value: usdToEthWei(5) });
      for (let i = 0; i < 5; i++) {
        await proposals.connect(alice).createProposal(MINOR, `Proposal ${i}`, "cat", "desc", []);
      }
      const page = await proposals.getProposals(0n, 3n);
      expect(page.length).to.equal(3);
      const page2 = await proposals.getProposals(3n, 3n);
      expect(page2.length).to.equal(2);
    });
  });
});