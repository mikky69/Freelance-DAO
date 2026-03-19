import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployAll, usdToEthWei } from "../helpers/fixtures";

const MINOR = 0;
const MAJOR = 1;

describe("Integration: Staking ↔ Proposals", function () {
  // ── Proposal Tier Gating via Live Staking ───────────────────────────────────
  describe("Proposal tier gating", function () {
    it("user staking $50 can only create MINOR proposals", async function () {
      const { staking, proposals, client } = await loadFixture(deployAll);
      await staking.connect(client).stake({ value: usdToEthWei(50) });

      // MINOR works
      await expect(
        proposals.connect(client).createProposal(MINOR, "Minor Prop", "cat", "desc", [])
      ).to.emit(proposals, "ProposalCreated");

      // MAJOR fails
      await expect(
        proposals.connect(client).createProposal(MAJOR, "Major Prop", "cat", "desc", [])
      ).to.be.revertedWith("Proposals: MAJOR requires >= $100 USD staked");
    });

    it("user who stakes $100+ can create MAJOR proposals", async function () {
      const { staking, proposals, freelancer } = await loadFixture(deployAll);
      await staking.connect(freelancer).stake({ value: usdToEthWei(100) });

      await expect(
        proposals.connect(freelancer).createProposal(MAJOR, "Major Prop", "governance", "desc", [])
      ).to.emit(proposals, "ProposalCreated");
    });

    it("user losing stake below $100 by unstaking loses MAJOR eligibility", async function () {
      const { staking, proposals, client } = await loadFixture(deployAll);
      await staking.connect(client).stake({ value: usdToEthWei(150) });

      // Can create MAJOR initially
      await proposals.connect(client).createProposal(MAJOR, "Prop1", "gov", "desc", []);

      // Unstake to drop below $100
      const drop = usdToEthWei(60);
      await staking.connect(client).unstake(drop);

      // MAJOR now fails
      await expect(
        proposals.connect(client).createProposal(MAJOR, "Prop2", "gov", "desc", [])
      ).to.be.revertedWith("Proposals: MAJOR requires >= $100 USD staked");

      // MINOR still works
      await expect(
        proposals.connect(client).createProposal(MINOR, "Minor Prop", "cat", "desc", [])
      ).to.emit(proposals, "ProposalCreated");
    });
  });

  // ── Stake Change Notifications ──────────────────────────────────────────────
  describe("Staking → Proposals bidirectional notification", function () {
    it("staking emits StakeChangedNotified in Proposals contract", async function () {
      const { staking, proposals, staker1 } = await loadFixture(deployAll);
      const amount = usdToEthWei(10);

      await expect(staking.connect(staker1).stake({ value: amount }))
        .to.emit(proposals, "StakeChangedNotified")
        .withArgs(await staker1.getAddress(), amount);
    });

    it("unstaking triggers stake change notification in Proposals", async function () {
      const { staking, proposals, staker1 } = await loadFixture(deployAll);
      const amount = usdToEthWei(20);
      await staking.connect(staker1).stake({ value: amount });

      const partial = usdToEthWei(5);
      await expect(staking.connect(staker1).unstake(partial))
        .to.emit(proposals, "StakeChangedNotified")
        .withArgs(await staker1.getAddress(), amount - partial);
    });
  });

  // ── Voting Weight from Staking ──────────────────────────────────────────────
  describe("Weighted voting via staking power", function () {
    it("vote weight equals ETH staked at vote time", async function () {
      const { staking, proposals, client, freelancer } = await loadFixture(deployAll);

      // client stakes $50, freelancer stakes $200
      const clientStake     = usdToEthWei(50);
      const freelancerStake = usdToEthWei(200);
      await staking.connect(client).stake({ value: clientStake });
      await staking.connect(freelancer).stake({ value: freelancerStake });

      // Client creates proposal
      await proposals.connect(client).createProposal(MINOR, "Prop", "cat", "desc", []);

      // Both vote — freelancer's weight dominates
      await proposals.connect(client).vote(1n, false);
      await proposals.connect(freelancer).vote(1n, true);

      const p = await proposals.getProposal(1n);
      expect(p.yesVotes).to.equal(freelancerStake);
      expect(p.noVotes).to.equal(clientStake);
    });

    it("voting snapshot is immutable after vote — unstaking doesn't change it", async function () {
      const { staking, proposals, client } = await loadFixture(deployAll);
      const stakeAmount = usdToEthWei(50);
      await staking.connect(client).stake({ value: stakeAmount });
      await proposals.connect(client).createProposal(MINOR, "Prop", "cat", "desc", []);

      // Vote (snapshot = $50)
      await proposals.connect(client).vote(1n, true);
      const snapshot = await proposals.getVoterSnapshot(1n, await client.getAddress());
      expect(snapshot).to.equal(stakeAmount);

      // Unstake everything
      await staking.connect(client).unstake(stakeAmount);

      // Snapshot unchanged
      const snapshotAfter = await proposals.getVoterSnapshot(1n, await client.getAddress());
      expect(snapshotAfter).to.equal(stakeAmount);

      // Votes on proposal also unchanged
      const p = await proposals.getProposal(1n);
      expect(p.yesVotes).to.equal(stakeAmount);
    });
  });

  // ── Full Proposal Lifecycle ──────────────────────────────────────────────────
  describe("Full proposal lifecycle with stake changes", function () {
    it("MAJOR proposal passes when yes > no and quorum met", async function () {
      const { staking, proposals, client, freelancer, daoMember1 } = await loadFixture(deployAll);

      await staking.connect(client).stake({ value: usdToEthWei(200) });
      await staking.connect(freelancer).stake({ value: usdToEthWei(50) });
      await staking.connect(daoMember1).stake({ value: usdToEthWei(30) });

      // Set quorum = sum of all 3 stakes so only full participation passes
      const totalVotes = usdToEthWei(200) + usdToEthWei(50) + usdToEthWei(30);
      await proposals.setQuorumThresholdWei(totalVotes);

      await proposals.connect(client).createProposal(MAJOR, "Major Upgrade", "gov", "desc", []);

      await proposals.connect(client).vote(1n, true);
      await proposals.connect(freelancer).vote(1n, true);
      await proposals.connect(daoMember1).vote(1n, false);

      await time.increase(3 * 24 * 3600 + 1);
      await expect(proposals.finalizeProposal(1n))
        .to.emit(proposals, "ProposalFinalized")
        .withArgs(1n, true, usdToEthWei(200) + usdToEthWei(50), usdToEthWei(30));
    });

    it("proposal fails when quorum not met", async function () {
      const { staking, proposals, client } = await loadFixture(deployAll);
      await staking.connect(client).stake({ value: usdToEthWei(5) });

      // Set a very high quorum
      await proposals.setQuorumThresholdWei(ethers.parseEther("1000"));

      await proposals.connect(client).createProposal(MINOR, "Prop", "cat", "desc", []);
      await proposals.connect(client).vote(1n, true);

      await time.increase(3 * 24 * 3600 + 1);
      await expect(proposals.finalizeProposal(1n))
        .to.emit(proposals, "ProposalFinalized")
        .withArgs(1n, false, usdToEthWei(5), 0n); // not approved
    });
  });

  // ── getUserProposals ─────────────────────────────────────────────────────────
  describe("getUserProposals()", function () {
    it("returns all proposals created by a specific user", async function () {
      const { staking, proposals, client } = await loadFixture(deployAll);
      await staking.connect(client).stake({ value: usdToEthWei(5) });

      await proposals.connect(client).createProposal(MINOR, "P1", "cat", "d1", []);
      await proposals.connect(client).createProposal(MINOR, "P2", "cat", "d2", []);

      const userProposals = await proposals.getUserProposals(await client.getAddress());
      expect(userProposals.length).to.equal(2);
      expect(userProposals[0].title).to.equal("P1");
      expect(userProposals[1].title).to.equal("P2");
    });
  });
});