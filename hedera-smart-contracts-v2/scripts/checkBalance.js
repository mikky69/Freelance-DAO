import hre from "hardhat";

async function main() {
  console.log("🔍 Checking Account Balance...\n");

  const [deployer] = await hre.ethers.getSigners();
  
  console.log("📋 Account Details:");
  console.log("   Address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInHBAR = hre.ethers.formatEther(balance);
  
  console.log("   Balance:", balanceInHBAR, "HBAR");
  console.log();

  // Check if sufficient for deployment
  const estimatedDeploymentCost = 50; // HBAR
  const balanceNum = parseFloat(balanceInHBAR);

  if (balanceNum < estimatedDeploymentCost) {
    console.log("⚠️  WARNING: Balance may be insufficient for deployment");
    console.log("   Estimated deployment cost: ~50 HBAR");
    console.log("   Your balance:", balanceNum, "HBAR");
    console.log();
    console.log("💡 Get more HBAR from:");
    console.log("   Testnet: https://portal.hedera.com/");
    console.log();
  } else {
    console.log("✅ Balance is sufficient for deployment!");
    console.log();
  }

  // Network info
  const network = hre.network.name;
  console.log("🌐 Network:", network);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error checking balance:");
    console.error(error);
    process.exit(1);
  });