import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployEscrow, defaultJobParams } from "../helpers/fixtures";

describe("FreelanceDAOEscrowV2 — Unit Tests", function () {
  async function setup() {
    const [owner, treasury, client, freelancer, other] = await ethers.getSigners();
    const escrow = await deployEscrow(await treasury.getAddress(), owner);
    return { escrow, owner, treasury, client, freelancer, other };
  }

  const JOB_VALUE = ethers.parseEther("1");

  // ── Fixed Job Lifecycle ──────────────────────────────────────────────────────
  describe("Fixed Job — full lifecycle", function () {
    it("creates a fixed job with correct state", async function () {
      const { escrow, client } = await loadFixture(setup);
      const params = await defaultJobParams();
      await escrow.connect(client).createFixedJob(params, { value: JOB_VALUE });

      const job = await escrow.getJob(1n);
      expect(job.client).to.equal(await client.getAddress());
      expect(job.totalAmount).to.equal(JOB_VALUE);
      expect(job.funded).to.be.true;
      expect(job.status).to.equal(0); // OPEN
    });

    it("freelancer requests and is approved", async function () {
      const { escrow, client, freelancer } = await loadFixture(setup);
      await escrow.connect(client).createFixedJob(await defaultJobParams(), { value: JOB_VALUE });
      await escrow.connect(freelancer).requestJob(1n);
      await expect(escrow.connect(client).approveProvider(1n, await freelancer.getAddress()))
        .to.emit(escrow, "ProviderApproved");
    });

    it("freelancer marks delivery", async function () {
      const { escrow, client, freelancer } = await loadFixture(setup);
      await escrow.connect(client).createFixedJob(await defaultJobParams(), { value: JOB_VALUE });
      await escrow.connect(freelancer).requestJob(1n);
      await escrow.connect(client).approveProvider(1n, await freelancer.getAddress());
      await expect(escrow.connect(freelancer).markDelivery(1n, 0n))
        .to.emit(escrow, "DeliveryMarked");
    });

    it("client confirms fixed job", async function () {
      const { escrow, client, freelancer } = await loadFixture(setup);
      await escrow.connect(client).createFixedJob(await defaultJobParams(), { value: JOB_VALUE });
      await escrow.connect(freelancer).requestJob(1n);
      await escrow.connect(client).approveProvider(1n, await freelancer.getAddress());
      await escrow.connect(freelancer).markDelivery(1n, 0n);
      await expect(escrow.connect(client).confirmFixedJob(1n))
        .to.emit(escrow, "FixedJobConfirmed")
        .withArgs(1n, JOB_VALUE);
    });

    it("freelancer withdraws earnings with 5% fee", async function () {
      const { escrow, client, freelancer, treasury } = await loadFixture(setup);
      await escrow.connect(client).createFixedJob(await defaultJobParams(), { value: JOB_VALUE });
      await escrow.connect(freelancer).requestJob(1n);
      await escrow.connect(client).approveProvider(1n, await freelancer.getAddress());
      await escrow.connect(freelancer).markDelivery(1n, 0n);
      await escrow.connect(client).confirmFixedJob(1n);

      const balBefore = await ethers.provider.getBalance(await freelancer.getAddress());
      const tx  = await escrow.connect(freelancer).withdraw(1n);
      const rec = await tx.wait();
      const gas = rec!.gasUsed * rec!.gasPrice;
      const balAfter = await ethers.provider.getBalance(await freelancer.getAddress());

      const expectedFee = JOB_VALUE * 5n / 100n;   // 5%
      const expectedNet = JOB_VALUE - expectedFee;
      expect(balAfter).to.equal(balBefore + expectedNet - gas);
      expect(await escrow.totalDaoFeesCollected()).to.equal(expectedFee);
    });
  });

  // ── Milestone Job ────────────────────────────────────────────────────────────
  describe("Milestone Job", function () {
    const M1 = ethers.parseEther("0.4");
    const M2 = ethers.parseEther("0.6");
    const TOTAL = M1 + M2;

    async function milestoneSetup() {
      const ctx = await setup();
      const { escrow, client, freelancer } = ctx;
      await escrow.connect(client).createMilestoneJob([M1, M2], await defaultJobParams(), { value: TOTAL });
      await escrow.connect(freelancer).requestJob(1n);
      await escrow.connect(client).approveProvider(1n, await freelancer.getAddress());
      return { ...ctx, M1, M2 };
    }

    it("creates milestone job with correct milestones", async function () {
      const { escrow } = await loadFixture(milestoneSetup);
      const ms = await escrow.getMilestones(1n);
      expect(ms.length).to.equal(2);
      expect(ms[0].amount).to.equal(M1);
      expect(ms[1].amount).to.equal(M2);
    });

    it("confirms each milestone independently", async function () {
      const { escrow, client, freelancer } = await loadFixture(milestoneSetup);
      await escrow.connect(freelancer).markDelivery(1n, 0n);
      await expect(escrow.connect(client).confirmMilestone(1n, 0n))
        .to.emit(escrow, "MilestoneConfirmed")
        .withArgs(1n, 0n, M1);
    });

    it("early withdrawal takes 10% fee", async function () {
      const { escrow, client, freelancer } = await loadFixture(milestoneSetup);
      await escrow.connect(freelancer).markDelivery(1n, 0n);
      await escrow.connect(client).confirmMilestone(1n, 0n);

      await expect(escrow.connect(freelancer).withdraw(1n))
        .to.emit(escrow, "WithdrawalMade")
        .withArgs(1n, await freelancer.getAddress(), M1 * 90n / 100n, M1 * 10n / 100n, true);
    });

    it("final withdrawal (all milestones) takes 5% fee", async function () {
      const { escrow, client, freelancer } = await loadFixture(milestoneSetup);
      await escrow.connect(freelancer).markDelivery(1n, 0n);
      await escrow.connect(client).confirmMilestone(1n, 0n);
      await escrow.connect(freelancer).markDelivery(1n, 1n);
      await escrow.connect(client).confirmMilestone(1n, 1n);

      await expect(escrow.connect(freelancer).withdraw(1n))
        .to.emit(escrow, "WithdrawalMade")
        .withArgs(1n, await freelancer.getAddress(), TOTAL * 95n / 100n, TOTAL * 5n / 100n, false);
    });

    it("client can request refund for unconfirmed milestones", async function () {
      const { escrow, client, freelancer } = await loadFixture(milestoneSetup);
      await escrow.connect(freelancer).markDelivery(1n, 0n);
      await escrow.connect(client).confirmMilestone(1n, 0n);

      await expect(escrow.connect(client).clientRequestRefund(1n))
        .to.emit(escrow, "JobRefunded")
        .withArgs(1n, M2); // only unconfirmed M2 refunded
    });
  });

  // ── Cancel ───────────────────────────────────────────────────────────────────
  describe("cancelJob()", function () {
    it("client can cancel OPEN job and get full refund", async function () {
      const { escrow, client } = await loadFixture(setup);
      await escrow.connect(client).createFixedJob(await defaultJobParams(), { value: JOB_VALUE });

      const balBefore = await ethers.provider.getBalance(await client.getAddress());
      const tx  = await escrow.connect(client).cancelJob(1n);
      const rec = await tx.wait();
      const gas = rec!.gasUsed * rec!.gasPrice;
      const balAfter = await ethers.provider.getBalance(await client.getAddress());

      expect(balAfter).to.be.closeTo(balBefore + JOB_VALUE - gas, 1000n);
    });

    it("cannot cancel a PENDING job", async function () {
      const { escrow, client, freelancer } = await loadFixture(setup);
      await escrow.connect(client).createFixedJob(await defaultJobParams(), { value: JOB_VALUE });
      await escrow.connect(freelancer).requestJob(1n);
      await escrow.connect(client).approveProvider(1n, await freelancer.getAddress());

      await expect(escrow.connect(client).cancelJob(1n))
        .to.be.revertedWith("Escrow: can only cancel OPEN jobs");
    });
  });

  // ── Access Control ───────────────────────────────────────────────────────────
  describe("Access control", function () {
    it("rejects non-client confirming job", async function () {
      const { escrow, client, freelancer, other } = await loadFixture(setup);
      await escrow.connect(client).createFixedJob(await defaultJobParams(), { value: JOB_VALUE });
      await escrow.connect(freelancer).requestJob(1n);
      await escrow.connect(client).approveProvider(1n, await freelancer.getAddress());
      await escrow.connect(freelancer).markDelivery(1n, 0n);

      await expect(escrow.connect(other).confirmFixedJob(1n))
        .to.be.revertedWith("Escrow: only client");
    });

    it("rejects non-freelancer marking delivery", async function () {
      const { escrow, client, freelancer, other } = await loadFixture(setup);
      await escrow.connect(client).createFixedJob(await defaultJobParams(), { value: JOB_VALUE });
      await escrow.connect(freelancer).requestJob(1n);
      await escrow.connect(client).approveProvider(1n, await freelancer.getAddress());

      await expect(escrow.connect(other).markDelivery(1n, 0n))
        .to.be.revertedWith("Escrow: not assigned freelancer");
    });

    it("only dispute contract can notify disputes", async function () {
      const { escrow, other } = await loadFixture(setup);
      await expect(
        escrow.connect(other).notifyDisputeCreated(1n, 1n, 0)
      ).to.be.revertedWith("Escrow: only dispute contract");
    });
  });

  // ── Batch Withdraw ───────────────────────────────────────────────────────────
  describe("batchWithdraw()", function () {
    it("withdraws from multiple confirmed jobs in one tx", async function () {
      const { escrow, client, freelancer } = await loadFixture(setup);
      const JOB = ethers.parseEther("0.5");

      for (let i = 0; i < 3; i++) {
        await escrow.connect(client).createFixedJob(await defaultJobParams(), { value: JOB });
        await escrow.connect(freelancer).requestJob(BigInt(i + 1));
        await escrow.connect(client).approveProvider(BigInt(i + 1), await freelancer.getAddress());
        await escrow.connect(freelancer).markDelivery(BigInt(i + 1), 0n);
        await escrow.connect(client).confirmFixedJob(BigInt(i + 1));
      }

      await expect(escrow.connect(freelancer).batchWithdraw([1n, 2n, 3n]))
        .to.emit(escrow, "BatchWithdrawal");
    });

    it("reverts batch larger than MAX_BATCH_JOBS", async function () {
      const { escrow, freelancer } = await loadFixture(setup);
      const ids = Array.from({ length: 21 }, (_, i) => BigInt(i + 1));
      await expect(escrow.connect(freelancer).batchWithdraw(ids))
        .to.be.revertedWith("Escrow: batch too large");
    });
  });

  // ── Deadline / Late Delivery ─────────────────────────────────────────────────
  describe("Late delivery tracking", function () {
    it("marks job as late when delivered after deadline", async function () {
      const { escrow, client, freelancer } = await loadFixture(setup);
      const base = await defaultJobParams();
      const params = { ...base, deadline: BigInt((await ethers.provider.getBlock("latest"))!.timestamp + 60) };
      await escrow.connect(client).createFixedJob(params, { value: JOB_VALUE });
      await escrow.connect(freelancer).requestJob(1n);
      await escrow.connect(client).approveProvider(1n, await freelancer.getAddress());

      // Advance past deadline
      await ethers.provider.send("evm_increaseTime", [120]);
      await ethers.provider.send("evm_mine", []);

      await escrow.connect(freelancer).markDelivery(1n, 0n);
      expect(await escrow.isJobLate(1n)).to.be.true;
    });
  });
});