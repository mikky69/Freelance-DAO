/**
 * Verify all contracts on Basescan after deployment.
 * Usage: npx hardhat run scripts/verify.ts --network baseSepolia
 */
import { run, deployments, network } from "hardhat";

async function main() {
  console.log(`\nVerifying contracts on ${network.name}...\n`);

  const contracts = [
    "FreelanceDAOStaking",
    "FreelanceDAOEscrowV2",
    "FreelanceDAODisputeV2",
    "FreelanceDAOProposals",
  ];

  for (const name of contracts) {
    try {
      const dep = await deployments.get(name);
      console.log(`Verifying ${name} at ${dep.address}...`);
      await run("verify:verify", {
        address: dep.address,
        constructorArguments: [],
      });
      console.log(`  OK ${name} verified\n`);
    } catch (e: any) {
      if (e.message?.includes("Already Verified")) {
        console.log(`  OK ${name} already verified\n`);
      } else {
        console.error(`  FAIL ${name}:`, e.message, "\n");
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });