import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre;
  const { save, log } = deployments;
  const { deployer, daoTreasury } = await getNamedAccounts();

  const treasury = process.env.DAO_TREASURY_ADDRESS || daoTreasury;

  log("\n--- Deploying FreelanceDAOEscrowV2 (UUPS) ---");
  log(`  Owner / deployer : ${deployer}`);
  log(`  DAO Treasury     : ${treasury}`);

  const Escrow = await ethers.getContractFactory("FreelanceDAOEscrowV2");
  const proxy = await upgrades.deployProxy(
    Escrow,
    [treasury, deployer],
    { kind: "uups", initializer: "initialize" }
  );
  await proxy.waitForDeployment();
  const proxyAddr = await proxy.getAddress();
  await new Promise(r => setTimeout(r, 3000)); // wait for RPC to index ERC-1967 slot
  let implAddr = "unknown";
  try { implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr); } catch (_) {}

  log(`  Proxy            : ${proxyAddr}`);
  log(`  Implementation   : ${implAddr}`);

  await save("FreelanceDAOEscrowV2", {
    abi:     (await hre.artifacts.readArtifact("FreelanceDAOEscrowV2")).abi,
    address: proxyAddr,
  });
};

func.tags = ["Escrow", "all"];
export default func;