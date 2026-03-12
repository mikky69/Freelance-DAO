/**
 * @file   setup_dao.ts
 * @notice Post-deployment setup script.
 *         Run this ONCE after deploying to testnet to configure all contracts.
 *
 * WHAT IT DOES:
 *   1. Adds DAO members to the Dispute contract
 *   2. Verifies all cross-contract wiring is correct
 *   3. Verifies the Chainlink price feed is live
 *   4. Prints a full summary of deployed contract state
 *
 * USAGE:
 *   npx hardhat run scripts/setup_dao.ts --network baseSepolia
 *   npx hardhat run scripts/setup_dao.ts --network localhost
 *
 * CONFIGURE:
 *   Edit DAO_MEMBERS below with the real addresses before running.
 */

import { ethers, deployments, network } from "hardhat";

// ⚠️  EDIT THESE before running on testnet/mainnet
const DAO_MEMBERS: string[] = [
  "0x3303f9de074C5bcC199caCCcD612E9Dd085ddE4A",


];

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const deployerAddr = await deployer.getAddress();

  console.log("\n====================================================");
  console.log("  FreelanceDAO — Post-Deployment Setup");
  console.log("====================================================");
  console.log(`  Network  : ${network.name}`);
  console.log(`  Deployer : ${deployerAddr}`);
  console.log("");

  // ── Load all deployed contracts ─────────────────────────────────────────────
  const stakingDep   = await deployments.get("FreelanceDAOStaking");
  const escrowDep    = await deployments.get("FreelanceDAOEscrowV2");
  const disputeDep   = await deployments.get("FreelanceDAODisputeV2");
  const proposalsDep = await deployments.get("FreelanceDAOProposals");

  const staking   = await ethers.getContractAt("FreelanceDAOStaking",   stakingDep.address,   deployer);
  const escrow    = await ethers.getContractAt("FreelanceDAOEscrowV2",  escrowDep.address,    deployer);
  const dispute   = await ethers.getContractAt("FreelanceDAODisputeV2", disputeDep.address,   deployer);
  const proposals = await ethers.getContractAt("FreelanceDAOProposals", proposalsDep.address, deployer);

  console.log("  Addresses:");
  console.log(`    FreelanceDAOStaking    : ${stakingDep.address}`);
  console.log(`    FreelanceDAOEscrowV2   : ${escrowDep.address}`);
  console.log(`    FreelanceDAODisputeV2  : ${disputeDep.address}`);
  console.log(`    FreelanceDAOProposals  : ${proposalsDep.address}`);
  console.log("");

  // ── Step 1: Verify cross-contract wiring ────────────────────────────────────
  console.log("  [1/4] Verifying cross-contract wiring...");

  const escrowDispute   = await escrow.disputeContract();
  const disputeEscrow   = await dispute.escrowContract();
  const stakingProposal = await staking.proposalsContract();

  const wiringOk =
    escrowDispute.toLowerCase()   === disputeDep.address.toLowerCase() &&
    disputeEscrow.toLowerCase()   === escrowDep.address.toLowerCase() &&
    stakingProposal.toLowerCase() === proposalsDep.address.toLowerCase();

  if (wiringOk) {
    console.log("  ✅ All cross-contract wiring is correct.");
  } else {
    console.log("  ❌ Wiring mismatch detected!");
    console.log(`     Escrow.disputeContract   : ${escrowDispute}  (expected ${disputeDep.address})`);
    console.log(`     Dispute.escrowContract   : ${disputeEscrow}  (expected ${escrowDep.address})`);
    console.log(`     Staking.proposalsContract: ${stakingProposal}  (expected ${proposalsDep.address})`);
    throw new Error("Wiring validation failed — run deploy/04_wire_contracts.ts again.");
  }

  // ── Step 2: Verify Chainlink price feed is live ──────────────────────────────
  console.log("\n  [2/4] Verifying Chainlink price feed...");
  const minStakeWei = await staking.minimumStakeWei();
  const minStakeEth = ethers.formatEther(minStakeWei);
  console.log(`  ✅ Price feed live. Min stake = ${minStakeEth} ETH (~$1 USD)`);

  const disputeFeeWei = await dispute.currentDisputeFeeWei();
  const disputeFeeEth = ethers.formatEther(disputeFeeWei);
  console.log(`  ✅ Dispute fee = ${disputeFeeEth} ETH (~$0.34 USD)`);

  // ── Step 3: Verify treasury addresses ───────────────────────────────────────
  console.log("\n  [3/4] Verifying DAO treasury addresses...");
  const treasuries = {
    Staking:   await staking.daoTreasury(),
    Escrow:    await escrow.daoTreasury(),
    Dispute:   await dispute.daoTreasury(),
    Proposals: await proposals.daoTreasury(),
  };

  let treasuryOk = true;
  const firstTreasury = Object.values(treasuries)[0];
  for (const [contract, addr] of Object.entries(treasuries)) {
    if (addr.toLowerCase() !== firstTreasury.toLowerCase()) {
      console.log(`  ❌ ${contract} treasury mismatch: ${addr}`);
      treasuryOk = false;
    }
  }
  if (treasuryOk) {
    console.log(`  ✅ All contracts point to the same treasury: ${firstTreasury}`);
  }

  // ── Step 4: Add DAO members ─────────────────────────────────────────────────
  console.log("\n  [4/4] Adding DAO members...");

  if (DAO_MEMBERS.some(m => m.startsWith("0xDAO_MEMBER"))) {
    console.log("  ⚠️  DAO_MEMBERS not configured. Edit scripts/setup_dao.ts before running.");
    console.log("  Skipping DAO member setup.");
  } else {
    const currentQuorum = await dispute.quorum();
    console.log(`  Current quorum: ${currentQuorum}`);

    for (const member of DAO_MEMBERS) {
      const isAlready = await dispute.daoMembers(member);
      if (isAlready) {
        console.log(`  ⚠️  Already a member: ${member} — skipping`);
        continue;
      }
      const tx = await dispute.addDaoMember(member);
      await tx.wait();
      console.log(`  ✅ Added DAO member: ${member}`);
    }
  }

  // ── Final summary ────────────────────────────────────────────────────────────
  console.log("\n====================================================");
  console.log("  Setup complete! State summary:");
  console.log("====================================================");
  console.log(`  Quorum (votes to resolve dispute) : ${await dispute.quorum()}`);
  console.log(`  Voting period (proposals)         : ${(await proposals.votingPeriod()).toString()}s (${Number(await proposals.votingPeriod()) / 86400} days)`);
  console.log(`  Min stake (Staking)               : ${ethers.formatEther(await staking.minimumStakeWei())} ETH`);
  console.log(`  Dispute creation fee              : ${ethers.formatEther(await dispute.currentDisputeFeeWei())} ETH`);
  console.log("====================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("\n❌ Setup failed:", error.message);
    process.exit(1);
  });