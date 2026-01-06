const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting FreelanceDAO V2 deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with:", deployer.address);

  const DAO_TREASURY = deployer.address;
  const INITIAL_QUORUM = 3;
  const OWNER = deployer.address;

  // Deploy Escrow
  console.log("📦 Deploying FreelanceDAOEscrowV2...");
  const EscrowV2 = await hre.ethers.getContractFactory("FreelanceDAOEscrowV2");
  const escrow = await EscrowV2.deploy(DAO_TREASURY, OWNER);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ Escrow deployed to:", escrowAddress);

  // Deploy Dispute
  console.log("📦 Deploying FreelanceDAODisputeV2...");
  const DisputeV2 = await hre.ethers.getContractFactory("FreelanceDAODisputeV2");
  const dispute = await DisputeV2.deploy(INITIAL_QUORUM, DAO_TREASURY);
  await dispute.waitForDeployment();
  const disputeAddress = await dispute.getAddress();
  console.log("✅ Dispute deployed to:", disputeAddress);

  // Link contracts
  console.log("🔗 Linking contracts...");
  await escrow.setDisputeContract(disputeAddress);
  await dispute.setEscrowContract(escrowAddress);
  await dispute.addDaoMember(deployer.address);
  console.log("✅ Contracts linked!\n");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      escrow: escrowAddress,
      dispute: disputeAddress
    },
    config: {
      daoTreasury: DAO_TREASURY,
      initialQuorum: INITIAL_QUORUM,
      owner: OWNER
    }
  };

  // Save to hedera-deployments folder (for team reference)
  const deploymentsDir = path.join(__dirname, '../../hedera-deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(deploymentsDir, 'deployed-contracts.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Copy ABIs to hedera-frontend-abi folder (for your frontend)
  const abiDir = path.join(__dirname, '../../hedera-frontend-abi');
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Read artifacts and save ABIs
  const escrowArtifact = await hre.artifacts.readArtifact("FreelanceDAOEscrowV2");
  const disputeArtifact = await hre.artifacts.readArtifact("FreelanceDAODisputeV2");

  fs.writeFileSync(
    path.join(abiDir, 'FreelanceDAOEscrowV2.json'),
    JSON.stringify({
      address: escrowAddress,
      abi: escrowArtifact.abi
    }, null, 2)
  );

  fs.writeFileSync(
    path.join(abiDir, 'FreelanceDAODisputeV2.json'),
    JSON.stringify({
      address: disputeAddress,
      abi: disputeArtifact.abi
    }, null, 2)
  );

  console.log("🎉 DEPLOYMENT COMPLETE!\n");
  console.log("📋 CONTRACT ADDRESSES:");
  console.log("   Escrow: ", escrowAddress);
  console.log("   Dispute:", disputeAddress);
  console.log("\n💾 Files saved:");
  console.log("   - hedera-deployments/deployed-contracts.json");
  console.log("   - hedera-frontend-abi/FreelanceDAOEscrowV2.json");
  console.log("   - hedera-frontend-abi/FreelanceDAODisputeV2.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });