require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hedera_testnet: {
      url: process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 296,
      gas: 8000000,
      gasPrice: 700000000000,
    },
    hedera_mainnet: {
      url: process.env.HEDERA_MAINNET_RPC_URL || "https://mainnet.hashio.io/api",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 295,
      gas: 8000000,
      gasPrice: 700000000000,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
