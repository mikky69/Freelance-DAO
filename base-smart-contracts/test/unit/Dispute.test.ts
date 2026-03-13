import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployMockFeed, deployDispute, defaultJobParams } from "../helpers/fixtures";

// DisputeReason enum
const LATE_DELIVERY  = 0;
const REFUND_REQUEST = 1;
const QUALITY_ISSUE  = 2;
const OTHER          = 3;

// DisputeStatus enum
const STATUS_OPEN     = 0;
const STATUS_RESOLVED = 1;
const STATUS_REJECTED = 2;

describe("FreelanceDAODisputeV2 — Unit Tests", function () {
  async function setup() {
    const [owner, treasury, client, freelancer, dao1, dao2, dao3, nonMember] = await ethers.getSigners();
    const feed     = await deployMockFeed();
    const dispute  = await deployDispute(3n, feed, await treasury.getAddress(), owner);

    await dispute.connect(owner).addDaoMember(await dao1.getAddress());
    await dispute.connect(owner).addDaoMember(await dao2.getAddress());
    await dispute.connect(owner).addDaoMember(await dao3.getAddress());

    // Deploy a mock escrow so we can test wiring
    const EscrowFactory = await ethers.getContractFactory("FreelanceDAOEscrowV2");
    const { upgrades }  = require("hardhat");
    const escrow = await upgrades.deployProxy(
      EscrowFactory,
      [await treasury.getAddress(), await owner.getAddress()],
      { kind: "uups", initializer: "initialize" }
    );
    await escrow.waitForDeployment();
    await dispute.connect(owner).setEscrowContract(await escrow.getAddress());
    await escrow.connect(owner).setDisputeContract(await dispute.getAddress());

    // Create 4 jobs so pagination test can open disputes against jobIds 1-4
    const JOB_VALUE = ethers.parseEther("1");
    const [,,, , , , , , jobClient] = await ethers.getSigners();
    for (let i = 0; i < 4; i++) {
      await escrow.connect(jobClient).createFixedJob(await defaultJobParams(), { value: JOB_VALUE });
    }

    return { dispute, escrow, feed, owner, treasury, client, freelancer, dao1, dao2, dao3, nonMember };
  }

  async function disputeFee(dispute: any) {
    return await dispute.currentDisputeFeeWei();
  }

  // ── Initialization ──────────────────────────────────────────────────────────
  describe("Initialization", function () {
    it("sets quorum correctly", async function () {
      const { dispute } = await loadFixture(setup);
      expect(await dispute.quorum()).to.equal(3n);
    });

    it("reports dynamic fee in ETH (~$0.34 at $3 000/ETH)", async function () {
      const { dispute } = await loadFixture(setup);
      const fee = await dispute.currentDisputeFeeWei();
      // $0.34 / $3000 = ~0.000113 ETH
      const expected = (34_000_000n * 10n ** 18n) / (3_000_00000000n);
      expect(fee).to.be.closeTo(expected, 100n); // allow minor rounding
    });
  });

  // ── Dispute Creation ─────────────────────────────────────────────────────────
  describe("createDispute()", function () {
    it("creates a dispute and emits event", async function () {
      const { dispute, client, freelancer } = await loadFixture(setup);
      const fee = await disputeFee(dispute);

      await expect(
        dispute.connect(client).createDispute(
          1n,
          await freelancer.getAddress(),
          "Late delivery",
          ethers.parseEther("1"),
          "dev",
          "Description",
          LATE_DELIVERY,
          { value: fee }
        )
      ).to.emit(dispute, "DisputeCreated");
    });

    it("rejects insufficient dispute fee", async function () {
      const { dispute, client, freelancer } = await loadFixture(setup);
      const fee = await disputeFee(dispute);

      await expect(
        dispute.connect(client).createDispute(
          1n, await freelancer.getAddress(), "Title", ethers.parseEther("1"), "cat", "desc",
          REFUND_REQUEST, { value: fee - 1n }
        )
      ).to.be.revertedWith("Dispute: insufficient fee (~$0.34 in ETH)");
    });

    it("forwards fee to DAO treasury", async function () {
      const { dispute, client, freelancer, treasury } = await loadFixture(setup);
      const fee  = await disputeFee(dispute);
      const balB = await ethers.provider.getBalance(await treasury.getAddress());

      await dispute.connect(client).createDispute(
        1n, await freelancer.getAddress(), "Title", ethers.parseEther("1"), "cat", "desc",
        REFUND_REQUEST, { value: fee }
      );

      const balA = await ethers.provider.getBalance(await treasury.getAddress());
      expect(balA).to.equal(balB + fee);
    });
  });

  // ── DAO Voting ────────────────────────────────────────────────────────────────
  describe("voteOnDispute()", function () {
    async function withOpenDispute() {
      const ctx = await setup();
      const fee = await ctx.dispute.currentDisputeFeeWei();
      await ctx.dispute.connect(ctx.client).createDispute(
        1n, await ctx.freelancer.getAddress(), "Quality issue", ethers.parseEther("1"),
        "cat", "desc", QUALITY_ISSUE, { value: fee }
      );
      return { ...ctx, fee };
    }

    it("allows DAO member to vote", async function () {
      const { dispute, dao1 } = await loadFixture(withOpenDispute);
      await expect(dispute.connect(dao1).voteOnDispute(1n, true))
        .to.emit(dispute, "VoteCast").withArgs(1n, await dao1.getAddress(), true);
    });

    it("rejects non-DAO member vote", async function () {
      const { dispute, nonMember } = await loadFixture(withOpenDispute);
      await expect(dispute.connect(nonMember).voteOnDispute(1n, true))
        .to.be.revertedWith("Dispute: only DAO members");
    });

    it("rejects double vote", async function () {
      const { dispute, dao1 } = await loadFixture(withOpenDispute);
      await dispute.connect(dao1).voteOnDispute(1n, true);
      await expect(dispute.connect(dao1).voteOnDispute(1n, false))
        .to.be.revertedWith("Dispute: already voted");
    });

    it("resolves for client when 3 votes reach quorum (client wins)", async function () {
      const { dispute, dao1, dao2, dao3, client } = await loadFixture(withOpenDispute);
      await dispute.connect(dao1).voteOnDispute(1n, true);
      await dispute.connect(dao2).voteOnDispute(1n, true);
      await expect(dispute.connect(dao3).voteOnDispute(1n, true))
        .to.emit(dispute, "DisputeResolved")
        .withArgs(1n, await client.getAddress(), STATUS_RESOLVED, QUALITY_ISSUE);
    });

    it("resolves for freelancer when they win majority", async function () {
      const { dispute, dao1, dao2, dao3, freelancer } = await loadFixture(withOpenDispute);
      await dispute.connect(dao1).voteOnDispute(1n, false);
      await dispute.connect(dao2).voteOnDispute(1n, false);
      await expect(dispute.connect(dao3).voteOnDispute(1n, false))
        .to.emit(dispute, "DisputeResolved")
        .withArgs(1n, await freelancer.getAddress(), STATUS_RESOLVED, QUALITY_ISSUE);
    });

    it("rejects vote on LATE_DELIVERY (auto-resolved type)", async function () {
      const ctx = await setup();
      const fee = await ctx.dispute.currentDisputeFeeWei();
      await ctx.dispute.connect(ctx.client).createDispute(
        1n, await ctx.freelancer.getAddress(), "Late", ethers.parseEther("1"),
        "cat", "desc", LATE_DELIVERY, { value: fee }
      );
      await expect(ctx.dispute.connect(ctx.dao1).voteOnDispute(1n, true))
        .to.be.revertedWith("Dispute: does not require DAO vote");
    });
  });

  // ── Auto Resolution ───────────────────────────────────────────────────────────
  describe("autoResolveDispute()", function () {
    it("auto-resolves LATE_DELIVERY with freelancer as winner", async function () {
      const { dispute, client, freelancer } = await loadFixture(setup);
      const fee = await dispute.currentDisputeFeeWei();
      await dispute.connect(client).createDispute(
        1n, await freelancer.getAddress(), "Late", ethers.parseEther("1"),
        "cat", "desc", LATE_DELIVERY, { value: fee }
      );
      await expect(dispute.autoResolveDispute(1n))
        .to.emit(dispute, "DisputeResolved")
        .withArgs(1n, await freelancer.getAddress(), STATUS_RESOLVED, LATE_DELIVERY);
    });

    it("reverts auto-resolve on a DAO-vote type dispute", async function () {
      const { dispute, client, freelancer } = await loadFixture(setup);
      const fee = await dispute.currentDisputeFeeWei();
      await dispute.connect(client).createDispute(
        1n, await freelancer.getAddress(), "Quality", ethers.parseEther("1"),
        "cat", "desc", QUALITY_ISSUE, { value: fee }
      );
      await expect(dispute.autoResolveDispute(1n))
        .to.be.revertedWith("Dispute: requires DAO vote first");
    });
  });

  // ── Admin ─────────────────────────────────────────────────────────────────────
  describe("Admin functions", function () {
    it("only owner adds DAO members", async function () {
      const { dispute, client, nonMember } = await loadFixture(setup);
      await expect(
        dispute.connect(client).addDaoMember(await nonMember.getAddress())
      ).to.be.reverted;
    });

    it("owner can remove DAO members", async function () {
      const { dispute, owner, dao1 } = await loadFixture(setup);
      await expect(dispute.connect(owner).removeDaoMember(await dao1.getAddress()))
        .to.emit(dispute, "DaoMemberRemoved");
    });

    it("reverts removing non-member", async function () {
      const { dispute, owner, nonMember } = await loadFixture(setup);
      await expect(dispute.connect(owner).removeDaoMember(await nonMember.getAddress()))
        .to.be.revertedWith("Dispute: not a DAO member");
    });
  });

  // ── Pagination ────────────────────────────────────────────────────────────────
  describe("getDisputes() pagination", function () {
    it("returns paginated disputes", async function () {
      const { dispute, client, freelancer } = await loadFixture(setup);
      const fee = await dispute.currentDisputeFeeWei();
      for (let i = 0; i < 4; i++) {
        await dispute.connect(client).createDispute(
          BigInt(i + 1), await freelancer.getAddress(), `Dispute ${i}`,
          ethers.parseEther("1"), "cat", "desc", QUALITY_ISSUE, { value: fee }
        );
      }
      const page = await dispute.getDisputes(0n, 2n);
      expect(page.length).to.equal(2);
      const page2 = await dispute.getDisputes(2n, 2n);
      expect(page2.length).to.equal(2);
    });
  });
});