import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployMockFeed,
  deployStaking,
  usdToEthWei,
  ETH_PRICE_8DEC,
} from "../helpers/fixtures";

describe("FreelanceDAOStaking — Unit Tests", function () {
  async function setup() {
    const [owner, treasury, alice, bob] = await ethers.getSigners();
    const feed    = await deployMockFeed();
    const staking = await deployStaking(feed, await treasury.getAddress(), owner);
    return { staking, feed, owner, treasury, alice, bob };
  }

  // ── Initialization ──────────────────────────────────────────────────────────
  describe("Initialization", function () {
    it("sets owner correctly", async function () {
      const { staking, owner } = await loadFixture(setup);
      expect(await staking.owner()).to.equal(await owner.getAddress());
    });

    it("sets DAO treasury correctly", async function () {
      const { staking, treasury } = await loadFixture(setup);
      expect(await staking.daoTreasury()).to.equal(await treasury.getAddress());
    });

    it("reports correct minimum stake in wei for $1 at $3 000/ETH", async function () {
      const { staking } = await loadFixture(setup);
      const minWei = await staking.minimumStakeWei();
      // $1 USD at $3 000/ETH = 1/3000 ETH
      const expected = usdToEthWei(1);
      // Allow 1 wei rounding
      expect(minWei).to.be.closeTo(expected, 1n);
    });
  });

  // ── Staking ─────────────────────────────────────────────────────────────────
  describe("stake()", function () {
    it("accepts a stake worth > $1 USD", async function () {
      const { staking, alice } = await loadFixture(setup);
      const amount = usdToEthWei(2); // $2 worth
      await expect(staking.connect(alice).stake({ value: amount }))
        .to.emit(staking, "Staked")
        .withArgs(await alice.getAddress(), amount, (2n * 1n * 10n ** 8n));  // ~2e8 usd
    });

    it("rejects stake below $1 USD minimum", async function () {
      const { staking, alice } = await loadFixture(setup);
      const tooLittle = usdToEthWei(1) - 1n; // 1 wei below minimum
      await expect(
        staking.connect(alice).stake({ value: tooLittle })
      ).to.be.revertedWith("Staking: stake below $1 USD minimum");
    });

    it("rejects zero-value stake", async function () {
      const { staking, alice } = await loadFixture(setup);
      await expect(
        staking.connect(alice).stake({ value: 0n })
      ).to.be.revertedWith("Staking: must send ETH");
    });

    it("accumulates stake on multiple deposits", async function () {
      const { staking, alice } = await loadFixture(setup);
      const amount = usdToEthWei(5);
      await staking.connect(alice).stake({ value: amount });
      await staking.connect(alice).stake({ value: amount });
      expect(await staking.getStakedAmount(await alice.getAddress())).to.equal(amount * 2n);
    });

    it("adds staker to enumeration list only once", async function () {
      const { staking, alice } = await loadFixture(setup);
      const amount = usdToEthWei(5);
      await staking.connect(alice).stake({ value: amount });
      await staking.connect(alice).stake({ value: amount });
      expect(await staking.stakerCount()).to.equal(1n);
    });

    it("updates totalStaked", async function () {
      const { staking, alice, bob } = await loadFixture(setup);
      const a = usdToEthWei(5);
      const b = usdToEthWei(10);
      await staking.connect(alice).stake({ value: a });
      await staking.connect(bob).stake({ value: b });
      expect(await staking.totalStaked()).to.equal(a + b);
    });
  });

  // ── Unstaking ───────────────────────────────────────────────────────────────
  describe("unstake()", function () {
    it("allows full unstake", async function () {
      const { staking, alice } = await loadFixture(setup);
      const amount = usdToEthWei(10);
      await staking.connect(alice).stake({ value: amount });

      const balBefore = await ethers.provider.getBalance(await alice.getAddress());
      const tx  = await staking.connect(alice).unstake(amount);
      const rec = await tx.wait();
      const gas = rec!.gasUsed * rec!.gasPrice;
      const balAfter = await ethers.provider.getBalance(await alice.getAddress());

      expect(balAfter).to.equal(balBefore + amount - gas);
    });

    it("allows partial unstake", async function () {
      const { staking, alice } = await loadFixture(setup);
      const amount = usdToEthWei(10);
      await staking.connect(alice).stake({ value: amount });
      await staking.connect(alice).unstake(amount / 2n);
      expect(await staking.getStakedAmount(await alice.getAddress())).to.equal(amount / 2n);
    });

    it("reverts if unstake amount exceeds balance", async function () {
      const { staking, alice } = await loadFixture(setup);
      const amount = usdToEthWei(10);
      await staking.connect(alice).stake({ value: amount });
      await expect(
        staking.connect(alice).unstake(amount + 1n)
      ).to.be.revertedWith("Staking: insufficient staked balance");
    });

    it("emits Unstaked event", async function () {
      const { staking, alice } = await loadFixture(setup);
      const amount = usdToEthWei(10);
      await staking.connect(alice).stake({ value: amount });
      await expect(staking.connect(alice).unstake(amount))
        .to.emit(staking, "Unstaked")
        .withArgs(await alice.getAddress(), amount, 0n);
    });
  });

  // ── USD Value ────────────────────────────────────────────────────────────────
  describe("getStakedUSDValue()", function () {
    it("returns correct USD value at $3 000/ETH", async function () {
      const { staking, alice } = await loadFixture(setup);
      const oneEth = ethers.parseEther("1");
      await staking.connect(alice).stake({ value: oneEth });
      const usd = await staking.getStakedUSDValue(await alice.getAddress());
      // 1 ETH * $3 000 = $3 000 in 8 decimals = 3_000_00000000
      expect(usd).to.equal(3_000_00000000n);
    });
  });

  // ── Metadata ─────────────────────────────────────────────────────────────────
  describe("registerMetadata()", function () {
    it("allows staker to register metadata", async function () {
      const { staking, alice } = await loadFixture(setup);
      await staking.connect(alice).stake({ value: usdToEthWei(5) });
      await expect(
        staking.connect(alice).registerMetadata("developer", "I build smart contracts", ["Solidity"])
      ).to.emit(staking, "MetadataRegistered");
    });

    it("reverts if caller has no stake", async function () {
      const { staking, alice } = await loadFixture(setup);
      await expect(
        staking.connect(alice).registerMetadata("developer", "desc", [])
      ).to.be.revertedWith("Staking: must be an active staker");
    });
  });

  // ── Pagination ───────────────────────────────────────────────────────────────
  describe("getStakers() pagination", function () {
    it("paginates staker list correctly", async function () {
      const { staking, alice, bob, owner } = await loadFixture(setup);
      await staking.connect(alice).stake({ value: usdToEthWei(5) });
      await staking.connect(bob).stake({ value: usdToEthWei(5) });
      await staking.connect(owner).stake({ value: usdToEthWei(5) });

      const page1 = await staking.getStakers(0, 2);
      expect(page1.length).to.equal(2);

      const page2 = await staking.getStakers(2, 2);
      expect(page2.length).to.equal(1);

      const beyond = await staking.getStakers(10, 5);
      expect(beyond.length).to.equal(0);
    });
  });

  // ── Admin ────────────────────────────────────────────────────────────────────
  describe("Admin functions", function () {
    it("only owner can set proposals contract", async function () {
      const { staking, alice, bob } = await loadFixture(setup);
      await expect(
        staking.connect(alice).setProposalsContract(await bob.getAddress())
      ).to.be.reverted;
    });

    it("owner can update price feed", async function () {
      const { staking, owner } = await loadFixture(setup);
      const newFeed = await deployMockFeed();
      await expect(
        staking.connect(owner).setPriceFeed(await newFeed.getAddress())
      ).to.emit(staking, "PriceFeedUpdated");
    });

    it("rejects zero address for treasury update", async function () {
      const { staking, owner } = await loadFixture(setup);
      await expect(
        staking.connect(owner).setDaoTreasury(ethers.ZeroAddress)
      ).to.be.revertedWith("Staking: zero treasury");
    });
  });

  // ── Price Feed Staleness ─────────────────────────────────────────────────────
  describe("Stale price feed protection", function () {
    it("reverts stake when price feed is stale (> 1 hour old)", async function () {
      const { staking, feed, alice } = await loadFixture(setup);
      // Advance time by 2 hours without updating price feed
      await ethers.provider.send("evm_increaseTime", [2 * 3600]);
      await ethers.provider.send("evm_mine", []);
      await expect(
        staking.connect(alice).stake({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("PriceConverter: stale price feed");
    });
  });
});