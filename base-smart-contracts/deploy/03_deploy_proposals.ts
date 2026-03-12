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

  // Resolve staking proxy address
  const stakingDeployment = await get("FreelanceDAOStaking");
  const stakingAddr       = stakingDeployment.address;

  let priceFeed  = ETH_USD_FEED[network.name];
  if (!priceFeed) {
    const mock = await get("MockV3Aggregator");
    priceFeed  = mock.address;
  }

  log("\n--- Deploying FreelanceDAOProposals (UUPS) ---");
  log(`  Owner / deployer : ${deployer}`);
  log(`  Staking contract : ${stakingAddr}`);
  log(`  Price Feed       : ${priceFeed}`);
  log(`  DAO Treasury     : ${treasury}`);

  const Proposals = await ethers.getContractFactory("FreelanceDAOProposals");
  const proxy = await upgrades.deployProxy(
    Proposals,
    [stakingAddr, priceFeed, treasury, deployer],
    { kind: "uups", initializer: "initialize" }
  );
  await proxy.waitForDeployment();
  const proxyAddr = await proxy.getAddress();
  await new Promise(r => setTimeout(r, 3000)); // wait for RPC to index ERC-1967 slot
  let implAddr = "unknown";
  try { implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr); } catch (_) {}

  log(`  Proxy            : ${proxyAddr}`);
  log(`  Implementation   : ${implAddr}`);

  await save("FreelanceDAOProposals", {
    abi:     (await hre.artifacts.readArtifact("FreelanceDAOProposals")).abi,
    address: proxyAddr,
  });
};

func.tags = ["Proposals", "all"];
func.dependencies = ["Staking"];
export default func;