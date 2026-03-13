import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";

const ETH_USD_FEED: Record<string, string> = {
  baseSepolia: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
  hardhat:     "", // filled at runtime by fixture (mock)
  localhost:   "", // filled at runtime by fixture (mock)
};

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre;
  const { save, log } = deployments;
  const { deployer, daoTreasury } = await getNamedAccounts();

  const treasury = process.env.DAO_TREASURY_ADDRESS || daoTreasury;
  let priceFeed  = ETH_USD_FEED[network.name];

  // On local networks deploy a mock price feed
  if (!priceFeed) {
    log("Deploying MockV3Aggregator for local network...");
    const MockFeed = await ethers.getContractFactory("MockV3Aggregator");
    // ETH/USD price = $3 000.00 with 8 decimals
    const mock = await MockFeed.deploy(8, 3_000_00000000n);
    await mock.waitForDeployment();
    priceFeed = await mock.getAddress();
    log(`MockV3Aggregator deployed at ${priceFeed}`);

    await save("MockV3Aggregator", {
      abi:     (await hre.artifacts.readArtifact("MockV3Aggregator")).abi,
      address: priceFeed,
    });
  }

  log("\n--- Deploying FreelanceDAOStaking (UUPS) ---");
  log(`  Owner / deployer : ${deployer}`);
  log(`  DAO Treasury     : ${treasury}`);
  log(`  Price Feed       : ${priceFeed}`);

  const Staking = await ethers.getContractFactory("FreelanceDAOStaking");
  const proxy = await upgrades.deployProxy(
    Staking,
    [priceFeed, treasury, deployer],
    { kind: "uups", initializer: "initialize" }
  );
  await proxy.waitForDeployment();
  const proxyAddr = await proxy.getAddress();
  await new Promise(r => setTimeout(r, 3000)); // wait for RPC to index ERC-1967 slot
  let implAddr = "unknown";
  try { implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr); } catch (_) {}

  log(`  Proxy            : ${proxyAddr}`);
  log(`  Implementation   : ${implAddr}`);

  await save("FreelanceDAOStaking", {
    abi:     (await hre.artifacts.readArtifact("FreelanceDAOStaking")).abi,
    address: proxyAddr,
  });
};

func.tags = ["Staking", "all"];
export default func;