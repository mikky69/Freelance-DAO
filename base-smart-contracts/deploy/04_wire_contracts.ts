import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * Wire all cross-contract addresses after deployment.
 *
 * Connections established:
 *   Escrow  ← knows → Dispute   (bidirectional dispute notifications)
 *   Dispute ← knows → Escrow
 *   Staking ← knows → Proposals (bidirectional stake change notifications)
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  const { get, log } = deployments;

  const [deployer] = await ethers.getSigners();

  const escrowDep    = await get("FreelanceDAOEscrowV2");
  const disputeDep   = await get("FreelanceDAODisputeV2");
  const stakingDep   = await get("FreelanceDAOStaking");
  const proposalsDep = await get("FreelanceDAOProposals");

  const escrow    = await ethers.getContractAt("FreelanceDAOEscrowV2",   escrowDep.address,    deployer);
  const dispute   = await ethers.getContractAt("FreelanceDAODisputeV2",  disputeDep.address,   deployer);
  const staking   = await ethers.getContractAt("FreelanceDAOStaking",    stakingDep.address,   deployer);
  const proposals = await ethers.getContractAt("FreelanceDAOProposals",  proposalsDep.address, deployer);

  log("\n--- Wiring cross-contract references ---");

  // 1. Escrow → Dispute
  log(`  Escrow.setDisputeContract(${disputeDep.address})`);
  let tx = await escrow.setDisputeContract(disputeDep.address);
  await tx.wait();

  // 2. Dispute → Escrow
  log(`  Dispute.setEscrowContract(${escrowDep.address})`);
  tx = await dispute.setEscrowContract(escrowDep.address);
  await tx.wait();

  // 3. Staking → Proposals
  log(`  Staking.setProposalsContract(${proposalsDep.address})`);
  tx = await staking.setProposalsContract(proposalsDep.address);
  await tx.wait();

  log("\n✅ All contracts wired successfully.");
  log("\n=== Deployment Summary ===");
  log(`  FreelanceDAOStaking    : ${stakingDep.address}`);
  log(`  FreelanceDAOEscrowV2   : ${escrowDep.address}`);
  log(`  FreelanceDAODisputeV2  : ${disputeDep.address}`);
  log(`  FreelanceDAOProposals  : ${proposalsDep.address}`);
};

func.tags = ["Wire", "all"];
func.dependencies = ["Staking", "Escrow", "Dispute", "Proposals"];
export default func;