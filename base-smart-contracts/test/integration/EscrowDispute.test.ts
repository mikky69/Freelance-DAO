import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployAll, defaultJobParams, ETH_PRICE_8DEC } from "../helpers/fixtures";

const QUALITY_ISSUE  = 2;
const REFUND_REQUEST = 1;
const LATE_DELIVERY  = 0;

describe("Integration: Escrow ↔ Dispute", function () {
  const JOB_VALUE = ethers.parseEther("1");

  async function setupWithJobNoDelivery() {
    const ctx = await deployAll();
    const { escrow, client, freelancer } = ctx;

    await escrow.connect(client).createFixedJob(await defaultJobParams(), { value: JOB_VALUE });
    await escrow.connect(freelancer).requestJob(1n);
    await escrow.connect(client).approveProvider(1n, await freelancer.getAddress());
    // NOTE: delivery is NOT marked here — some tests need to control when it happens

    return ctx;
  }

  async function setupWithJob() {
    const ctx = await setupWithJobNoDelivery();
    await ctx.escrow.connect(ctx.freelancer).markDelivery(1n, 0n);
    return ctx;
  }

  // ── Dispute Created — Escrow Status Locked ─────────────────────────────────
  describe("Dispute creation locks escrow job", function () {
    it("sets job status to DISPUTED when dispute is created", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(setupWithJob);
      const fee = await dispute.currentDisputeFeeWei();

      await dispute.connect(client).createDispute(
        1n, await freelancer.getAddress(), "Quality", JOB_VALUE, "dev", "desc",
        QUALITY_ISSUE, { value: fee }
      );

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(4); // DISPUTED
    });
  });

  // ── Quality Issue — Client Wins ────────────────────────────────────────────
  describe("QUALITY_ISSUE dispute — client wins → refund", function () {
    it("refunds client after DAO votes for client (3/3)", async function () {
      const { escrow, dispute, client, freelancer, daoMember1, daoMember2, daoMember3 } =
        await loadFixture(setupWithJob);

      const fee = await dispute.currentDisputeFeeWei();
      await dispute.connect(client).createDispute(
        1n, await freelancer.getAddress(), "Quality", JOB_VALUE, "dev", "desc",
        QUALITY_ISSUE, { value: fee }
      );

      const clientBalBefore = await ethers.provider.getBalance(await client.getAddress());

      // 3 DAO members vote for client
      await dispute.connect(daoMember1).voteOnDispute(1n, true);
      await dispute.connect(daoMember2).voteOnDispute(1n, true);
      await dispute.connect(daoMember3).voteOnDispute(1n, true);

      const clientBalAfter = await ethers.provider.getBalance(await client.getAddress());
      expect(clientBalAfter).to.be.gt(clientBalBefore); // client received refund

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(5); // REFUNDED
    });
  });

  // ── Quality Issue — Freelancer Wins ────────────────────────────────────────
  describe("QUALITY_ISSUE dispute — freelancer wins → confirmed", function () {
    it("marks job as CONFIRMED after DAO votes for freelancer (3/3)", async function () {
      const { escrow, dispute, client, freelancer, daoMember1, daoMember2, daoMember3 } =
        await loadFixture(setupWithJob);

      const fee = await dispute.currentDisputeFeeWei();
      await dispute.connect(client).createDispute(
        1n, await freelancer.getAddress(), "Quality", JOB_VALUE, "dev", "desc",
        QUALITY_ISSUE, { value: fee }
      );

      await dispute.connect(daoMember1).voteOnDispute(1n, false);
      await dispute.connect(daoMember2).voteOnDispute(1n, false);
      await dispute.connect(daoMember3).voteOnDispute(1n, false);

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(3); // CONFIRMED
      expect(await escrow.getAvailableWithdrawal(1n)).to.equal(JOB_VALUE);
    });

    it("freelancer can withdraw after winning dispute", async function () {
      const { escrow, dispute, client, freelancer, daoMember1, daoMember2, daoMember3 } =
        await loadFixture(setupWithJob);

      const fee = await dispute.currentDisputeFeeWei();
      await dispute.connect(client).createDispute(
        1n, await freelancer.getAddress(), "Quality", JOB_VALUE, "dev", "desc",
        QUALITY_ISSUE, { value: fee }
      );

      await dispute.connect(daoMember1).voteOnDispute(1n, false);
      await dispute.connect(daoMember2).voteOnDispute(1n, false);
      await dispute.connect(daoMember3).voteOnDispute(1n, false);

      const freelancerBal = await ethers.provider.getBalance(await freelancer.getAddress());
      const tx  = await escrow.connect(freelancer).withdraw(1n);
      const rec = await tx.wait();
      const gas = rec!.gasUsed * rec!.gasPrice;
      const freelancerBalAfter = await ethers.provider.getBalance(await freelancer.getAddress());

      const expectedNet = JOB_VALUE * 95n / 100n; // 5% fee
      expect(freelancerBalAfter).to.be.closeTo(freelancerBal + expectedNet - gas, 1000n);
    });
  });

  // ── Late Delivery — Auto-Resolved ───────────────────────────────────────────
  describe("LATE_DELIVERY dispute — auto-resolved with penalty", function () {
    it("applies 7% fee on withdrawal after late delivery dispute", async function () {
      const { escrow, dispute, feed, client, freelancer } = await loadFixture(setupWithJobNoDelivery);
      const fee = await dispute.currentDisputeFeeWei();

      // Advance past deadline so delivery is marked as late
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 3600]);
      await ethers.provider.send("evm_mine", []);
      // Refresh mock price feed so it isn't stale after time advance
      await feed.updateAnswer(ETH_PRICE_8DEC);

      // Mark delivery AFTER deadline — sets j.isLate = true
      await escrow.connect(freelancer).markDelivery(1n, 0n);

      await dispute.connect(client).createDispute(
        1n, await freelancer.getAddress(), "Late", JOB_VALUE, "dev", "desc",
        LATE_DELIVERY, { value: fee }
      );

      // Auto-resolve (no DAO vote needed)
      await dispute.autoResolveDispute(1n);

      // Confirm the job so freelancer can withdraw
      await escrow.connect(client).confirmFixedJob(1n);

      await expect(escrow.connect(freelancer).withdraw(1n))
        .to.emit(escrow, "WithdrawalMade")
        .withArgs(
          1n,
          await freelancer.getAddress(),
          JOB_VALUE * 93n / 100n,  // 7% fee = 93% net
          JOB_VALUE * 7n / 100n,
          false
        );
    });
  });

  // ── Milestone Dispute ───────────────────────────────────────────────────────
  describe("Milestone job dispute — client wins → partial refund", function () {
    it("refunds only unconfirmed milestones after quality dispute", async function () {
      const { escrow, dispute, client, freelancer, daoMember1, daoMember2, daoMember3 } =
        await loadFixture(deployAll);

      const M1 = ethers.parseEther("0.4");
      const M2 = ethers.parseEther("0.6");

      await escrow.connect(client).createMilestoneJob([M1, M2], await defaultJobParams(), { value: M1 + M2 });
      await escrow.connect(freelancer).requestJob(1n);
      await escrow.connect(client).approveProvider(1n, await freelancer.getAddress());
      await escrow.connect(freelancer).markDelivery(1n, 0n);
      await escrow.connect(client).confirmMilestone(1n, 0n);

      const fee = await dispute.currentDisputeFeeWei();
      await dispute.connect(client).createDispute(
        1n, await freelancer.getAddress(), "Quality of M2", M2, "dev", "desc",
        QUALITY_ISSUE, { value: fee }
      );

      const clientBalBefore = await ethers.provider.getBalance(await client.getAddress());
      await dispute.connect(daoMember1).voteOnDispute(1n, true);
      await dispute.connect(daoMember2).voteOnDispute(1n, true);
      await dispute.connect(daoMember3).voteOnDispute(1n, true);

      const clientBalAfter = await ethers.provider.getBalance(await client.getAddress());
      expect(clientBalAfter).to.be.gt(clientBalBefore);

      const job = await escrow.getJob(1n);
      expect(job.status).to.equal(5); // REFUNDED
    });
  });
});