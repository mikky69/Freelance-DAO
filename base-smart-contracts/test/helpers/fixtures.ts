import { ethers, upgrades } from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Signer } from "ethers";
import type {
  FreelanceDAOStaking,
  FreelanceDAOProposals,
  FreelanceDAOEscrowV2,
  FreelanceDAODisputeV2,
  MockV3Aggregator,
} from "../../typechain-types";

// ─── Price Feed ─────────────────────────────────────────────────────────────
// ETH/USD = $3 000.00 → 3_000_00000000 (8 decimals)
export const ETH_PRICE_8DEC = 3_000_00000000n;

/** Deploy a fresh MockV3Aggregator. */
export async function deployMockFeed(): Promise<MockV3Aggregator> {
  const Factory = await ethers.getContractFactory("MockV3Aggregator");
  const feed = (await Factory.deploy(8, ETH_PRICE_8DEC)) as unknown as MockV3Aggregator;
  await feed.waitForDeployment();
  return feed;
}

// ─── Staking ─────────────────────────────────────────────────────────────────
export async function deployStaking(
  feed: MockV3Aggregator,
  treasury: string,
  owner: Signer
): Promise<FreelanceDAOStaking> {
  const Factory = await ethers.getContractFactory("FreelanceDAOStaking");
  const proxy   = await upgrades.deployProxy(
    Factory,
    [await feed.getAddress(), treasury, await owner.getAddress()],
    { kind: "uups", initializer: "initialize" }
  );
  await proxy.waitForDeployment();
  return proxy as unknown as FreelanceDAOStaking;
}

// ─── Proposals ───────────────────────────────────────────────────────────────
export async function deployProposals(
  staking:  FreelanceDAOStaking,
  feed:     MockV3Aggregator,
  treasury: string,
  owner:    Signer
): Promise<FreelanceDAOProposals> {
  const Factory = await ethers.getContractFactory("FreelanceDAOProposals");
  const proxy   = await upgrades.deployProxy(
    Factory,
    [
      await staking.getAddress(),
      await feed.getAddress(),
      treasury,
      await owner.getAddress(),
    ],
    { kind: "uups", initializer: "initialize" }
  );
  await proxy.waitForDeployment();
  return proxy as unknown as FreelanceDAOProposals;
}

// ─── Escrow ───────────────────────────────────────────────────────────────────
export async function deployEscrow(
  treasury: string,
  owner:    Signer
): Promise<FreelanceDAOEscrowV2> {
  const Factory = await ethers.getContractFactory("FreelanceDAOEscrowV2");
  const proxy   = await upgrades.deployProxy(
    Factory,
    [treasury, await owner.getAddress()],
    { kind: "uups", initializer: "initialize" }
  );
  await proxy.waitForDeployment();
  return proxy as unknown as FreelanceDAOEscrowV2;
}

// ─── Dispute ─────────────────────────────────────────────────────────────────
export async function deployDispute(
  quorum:   bigint,
  feed:     MockV3Aggregator,
  treasury: string,
  owner:    Signer
): Promise<FreelanceDAODisputeV2> {
  const Factory = await ethers.getContractFactory("FreelanceDAODisputeV2");
  const proxy   = await upgrades.deployProxy(
    Factory,
    [quorum, await feed.getAddress(), treasury, await owner.getAddress()],
    { kind: "uups", initializer: "initialize" }
  );
  await proxy.waitForDeployment();
  return proxy as unknown as FreelanceDAODisputeV2;
}

// ─── Full Suite ───────────────────────────────────────────────────────────────
/** Deploy and wire all 4 contracts for integration tests. */
export async function deployAll() {
  const signers   = await ethers.getSigners();
  const owner     = signers[0];
  const treasury  = signers[1];
  const client    = signers[2];
  const freelancer = signers[3];
  const daoMember1 = signers[4];
  const daoMember2 = signers[5];
  const daoMember3 = signers[6];
  const staker1   = signers[7];

  const treasuryAddr = await treasury.getAddress();

  // Deploy
  const feed      = await deployMockFeed();
  const staking   = await deployStaking(feed, treasuryAddr, owner);
  const proposals = await deployProposals(staking, feed, treasuryAddr, owner);
  const escrow    = await deployEscrow(treasuryAddr, owner);
  const dispute   = await deployDispute(3n, feed, treasuryAddr, owner);

  // Wire
  await staking.connect(owner).setProposalsContract(await proposals.getAddress());
  await escrow.connect(owner).setDisputeContract(await dispute.getAddress());
  await dispute.connect(owner).setEscrowContract(await escrow.getAddress());

  // Add DAO members
  await dispute.connect(owner).addDaoMember(await daoMember1.getAddress());
  await dispute.connect(owner).addDaoMember(await daoMember2.getAddress());
  await dispute.connect(owner).addDaoMember(await daoMember3.getAddress());

  return {
    feed, staking, proposals, escrow, dispute,
    owner, treasury, client, freelancer,
    daoMember1, daoMember2, daoMember3, staker1,
    treasuryAddr,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** ETH amount worth exactly $X USD at the mock price ($3 000/ETH).
 *  Uses CEILING division so the computed USD value is always >= the requested USD,
 *  avoiding off-by-one failures at exact thresholds (e.g. $100 MAJOR).
 */
export function usdToEthWei(usd: number): bigint {
  // ceil(usd * 1e18 / 3000) = (usd * 1e18 + 2999) / 3000
  return (BigInt(usd) * 10n ** 18n + 2999n) / 3_000n;
}

/** Default job params used in escrow tests.
 *  Uses blockchain time (time.latest) so deadline stays valid even when
 *  Hardhat's clock has been advanced past real-world time by time.increase().
 */
export async function defaultJobParams(deadlineOffset = 7 * 24 * 3600) {
  const now = await time.latest();
  return {
    jobTitle:           "Build a DApp",
    jobCategory:        "Development",
    projectDescription: "Full-stack DApp with smart contracts",
    requiredSkills:     ["Solidity", "TypeScript"],
    projectDuration:    "4 weeks",
    minimumBudget:      0n,
    maximumBudget:      0n,
    deadline:           BigInt(now + deadlineOffset),
  };
}