import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";

const ETH_USD_FEED: Record<string, string> = {
  baseSepolia: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
  hardhat:     "",
  localhost:   "",
};

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre;
  const { save, log, get } = deployments;
  const { deployer, daoTreasury } = await getNamedAccounts();

  const treasury = process.env.DAO_TREASURY_ADDRESS || daoTreasury;
  let priceFeed  = ETH_USD_FEED[network.name];

  if (!priceFeed) {
    // Reuse the mock deployed in script 00
    const mock = await get("MockV3Aggregator");
    priceFeed  = mock.address;
  }

  const QUORUM = 3; // 3 DAO members must vote to resolve

  log("\n--- Deploying FreelanceDAODisputeV2 (UUPS) ---");
  log(`  Owner / deployer : ${deployer}`);
  log(`  DAO Treasury     : ${treasury}`);
  log(`  Price Feed       : ${priceFeed}`);
  log(`  Quorum           : ${QUORUM}`);

  const Dispute = await ethers.getContractFactory("FreelanceDAODisputeV2");
  const proxy = await upgrades.deployProxy(
    Dispute,
    [QUORUM, priceFeed, treasury, deployer],
    { kind: "uups", initializer: "initialize" }
  );
  await proxy.waitForDeployment();
  const proxyAddr = await proxy.getAddress();
  await new Promise(r => setTimeout(r, 3000)); // wait for RPC to index ERC-1967 slot
  let implAddr = "unknown";
  try { implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr); } catch (_) {}

  log(`  Proxy            : ${proxyAddr}`);
  log(`  Implementation   : ${implAddr}`);

  await save("FreelanceDAODisputeV2", {
    abi:     (await hre.artifacts.readArtifact("FreelanceDAODisputeV2")).abi,
    address: proxyAddr,
  });
};

func.tags = ["Dispute", "all"];
func.dependencies = ["Staking"]; // Staking deploys the shared mock feed on local
export default func;