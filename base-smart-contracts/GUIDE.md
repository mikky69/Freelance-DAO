# FreeLanceDAO — Complete Project Guide
## Full Structure + Step-by-Step Setup, Test, Deploy & Verify

---

## PART 1 — FULL PROJECT STRUCTURE

```
freelance-dao/
│
├── contracts/                              ← All Solidity source files
│   │
│   ├── interfaces/                         ← Cross-contract communication contracts
│   │   ├── IEscrow.sol                     ← Callbacks Dispute calls on Escrow
│   │   │                                     (notifyDisputeCreated, notifyDisputeResolved)
│   │   ├── IDisputeResolution.sol          ← Methods Escrow calls on Dispute
│   │   │                                     (getDisputeOutcome, markDisputeExecuted)
│   │   ├── IStaking.sol                    ← Methods Proposals calls on Staking
│   │   │                                     (getStakedAmount, getStakedUSDValue)
│   │   └── IProposals.sol                  ← Callback Staking calls on Proposals
│   │                                         (onStakeChanged)
│   │
│   ├── libraries/                          ← Shared, reusable logic
│   │   ├── DataTypes.sol                   ← All shared enums:
│   │   │                                     DisputeReason, DisputeStatus, ProposalTier
│   │   ├── FeeCalculator.sol               ← Pure fee math:
│   │   │                                     5% normal, 7% late, 10% early withdrawal
│   │   └── PriceConverter.sol              ← Chainlink ETH/USD helpers:
│   │                                         weiToUSD(), usdToWei(), meetsUSDThreshold()
│   │                                         Includes 1-hour staleness check
│   │
│   ├── mocks/
│   │   └── MockV3Aggregator.sol            ← Fake Chainlink feed for local tests
│   │                                         Deployed automatically on hardhat/localhost
│   │
│   ├── FreelanceDAOStaking.sol             ← GOVERNANCE CLUSTER (Contract 1/4)
│   │                                         - ETH staking (min $1 USD via Chainlink)
│   │                                         - No rewards; pure governance power
│   │                                         - Notifies Proposals on every stake/unstake
│   │                                         - UUPS upgradeable
│   │
│   ├── FreelanceDAOProposals.sol           ← GOVERNANCE CLUSTER (Contract 2/4)
│   │                                         - MINOR proposals: >= $1 USD staked
│   │                                         - MAJOR proposals: >= $100 USD staked
│   │                                         - Weighted voting (weight = ETH staked, snapshot)
│   │                                         - Receives stake change notifications from Staking
│   │                                         - UUPS upgradeable
│   │
│   ├── FreelanceDAOEscrowV2.sol            ← ESCROW CLUSTER (Contract 3/4)
│   │                                         - Fixed jobs & milestone jobs
│   │                                         - Fees deducted at withdrawal, not upfront
│   │                                         - Notified by Dispute on create + resolve
│   │                                         - Batch withdraw (max 20 jobs)
│   │                                         - UUPS upgradeable
│   │
│   └── FreelanceDAODisputeV2.sol           ← ESCROW CLUSTER (Contract 4/4)
│                                             - Dynamic fee: ~$0.34 USD in ETH (Chainlink)
│                                             - LATE_DELIVERY: auto-resolved, no DAO vote
│                                             - Others: DAO member voting, quorum = 3
│                                             - Notifies Escrow on create + resolve
│                                             - UUPS upgradeable
│
├── deploy/                                 ← Hardhat-deploy scripts (run in order)
│   ├── 00_deploy_staking.ts                ← Deploys Staking proxy + MockFeed if local
│   ├── 01_deploy_escrow.ts                 ← Deploys Escrow proxy
│   ├── 02_deploy_dispute.ts                ← Deploys Dispute proxy (reuses MockFeed if local)
│   ├── 03_deploy_proposals.ts              ← Deploys Proposals proxy (reads Staking address)
│   └── 04_wire_contracts.ts                ← Sets all cross-contract addresses:
│                                             Escrow ↔ Dispute
│                                             Staking → Proposals
│
├── test/
│   ├── helpers/
│   │   └── fixtures.ts                     ← Shared deploy functions + test utilities:
│   │                                         deployAll(), deployStaking(), usdToEthWei()
│   │                                         defaultJobParams(), ETH_PRICE_8DEC
│   │
│   ├── unit/                               ← Isolated per-contract tests
│   │   ├── Staking.test.ts                 ← stake, unstake, $1 min, metadata, pagination
│   │   ├── Proposals.test.ts               ← MINOR/MAJOR gating, vote, finalize, onStakeChanged
│   │   ├── Escrow.test.ts                  ← Full job lifecycle, fees, batch, cancel, late
│   │   └── Dispute.test.ts                 ← Create, vote, auto-resolve, dynamic fee
│   │
│   └── integration/                        ← Cross-contract interaction tests
│       ├── EscrowDispute.test.ts           ← Full dispute flows end-to-end:
│       │                                     dispute created → votes → escrow acts
│       └── StakingProposals.test.ts        ← Stake gates, notifications, weighted voting
│
├── scripts/
│   ├── slither.sh                          ← Slither static analysis (all 4 contracts)
│   │                                         Output: reports/slither_<Name>_<timestamp>.txt
│   ├── mythril.sh                          ← Mythril symbolic execution
│   │                                         Usage: bash scripts/mythril.sh [ContractName]
│   │                                         Output: reports/mythril/<Name>_<timestamp>.json
│   └── verify.ts                           ← Basescan contract verification
│                                             Usage: npx hardhat run scripts/verify.ts --network baseSepolia
│
├── reports/                                ← Auto-created by analysis scripts (gitignored)
│   ├── slither_FreelanceDAOStaking_*.txt
│   ├── slither_FreelanceDAOEscrowV2_*.txt
│   └── mythril/
│       └── FreelanceDAOEscrowV2_*.json
│
├── deployments/                            ← Auto-created by hardhat-deploy
│   ├── localhost/                          ← Local deployment records
│   │   ├── FreelanceDAOStaking.json        ← Contains proxy address + ABI
│   │   ├── FreelanceDAOEscrowV2.json
│   │   ├── FreelanceDAODisputeV2.json
│   │   └── FreelanceDAOProposals.json
│   └── baseSepolia/                        ← Testnet deployment records
│       └── ...same files...
│
├── artifacts/                              ← Auto-created by hardhat compile (gitignored)
├── cache/                                  ← Auto-created by hardhat compile (gitignored)
├── typechain-types/                        ← Auto-generated TypeScript types (gitignored)
│
├── hardhat.config.ts                       ← Network config, compiler, plugins
├── tsconfig.json                           ← TypeScript compiler settings
├── package.json                            ← Dependencies + npm scripts
├── mythril-solc.json                       ← Mythril import remappings
├── .solhint.json                           ← Solidity linter rules
├── .env.example                            ← Template for your .env file
├── .gitignore                              ← What to exclude from git
└── README.md                               ← Full technical documentation
```

---

## PART 2 — WHAT EACH FILE DOES (QUICK REFERENCE)

| File | Purpose | Touches |
|------|---------|---------|
| `DataTypes.sol` | Single source of truth for all enums | All 4 contracts |
| `FeeCalculator.sol` | Pure fee math — no state | Escrow only |
| `PriceConverter.sol` | Chainlink price helpers + staleness check | Staking, Proposals, Dispute |
| `IEscrow.sol` | Interface Dispute uses to talk to Escrow | Dispute → Escrow |
| `IDisputeResolution.sol` | Interface Escrow uses to query Dispute | Escrow → Dispute |
| `IStaking.sol` | Interface Proposals uses to read staking data | Proposals → Staking |
| `IProposals.sol` | Interface Staking uses to notify Proposals | Staking → Proposals |
| `MockV3Aggregator.sol` | Chainlink price feed replacement in tests | Test environment only |
| `fixtures.ts` | Single-call deploy functions used by all tests | All test files |

---

## PART 3 — STEP-BY-STEP GUIDE

---

### STEP 1 — System Prerequisites

Before touching the project, make sure these are installed on your machine.

**Check Node.js version (must be >= 18):**
```bash
node --version
# Expected: v18.x.x or v20.x.x or v22.x.x
```

If not installed or wrong version:
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc   # or ~/.zshrc on Mac
nvm install 20
nvm use 20
node --version     # should now show v20.x.x
```

**Check npm version (must be >= 9):**
```bash
npm --version
# Expected: 9.x.x or 10.x.x
```

**Check Git:**
```bash
git --version
# Expected: git version 2.x.x
```

**Check Python (needed for Slither + Mythril):**
```bash
python3 --version
# Expected: 3.10 or higher

pip3 --version
# If missing on Ubuntu: sudo apt install python3-pip
# If missing on Mac:    brew install python3
```

---

### STEP 2 — Get the Project

```bash
# Option A: If you have a git repo
git clone <your-repo-url>
cd freelance-dao

# Option B: If you downloaded the folder
cd /path/to/freelance-dao
```

Confirm you are in the right place:
```bash
ls
# Should show: contracts/ deploy/ test/ scripts/ hardhat.config.ts package.json etc.
```

---

### STEP 3 — Install Node Dependencies

```bash
npm install
```

This installs everything in `package.json`:
- `hardhat` — development framework
- `@openzeppelin/contracts` and `@openzeppelin/contracts-upgradeable` — v5 (UUPS)
- `@chainlink/contracts` — price feed interfaces
- `@nomicfoundation/hardhat-toolbox` — ethers, waffle, typechain bundled
- `@openzeppelin/hardhat-upgrades` — proxy deployment helpers
- `hardhat-deploy` — ordered deploy scripts
- `typescript`, `ts-node` — TypeScript support

**Confirm it worked:**
```bash
ls node_modules | grep hardhat
# Should show: hardhat, hardhat-deploy, hardhat-gas-reporter etc.
```

---

### STEP 4 — Set Up Your Environment File

```bash
cp .env.example .env
```

Now open `.env` in your editor and fill in every value:

```bash
# Your wallet's private key — the account that will DEPLOY the contracts
# NEVER share this. NEVER commit this.
PRIVATE_KEY=0xYOUR_ACTUAL_PRIVATE_KEY_HERE

# Base Sepolia RPC — get a free one from Alchemy (recommended) or Infura
# Alchemy: https://dashboard.alchemy.com → Create App → Base → Base Sepolia
BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# OR use the public endpoint (slower, rate-limited):
# BASE_SEPOLIA_RPC=https://sepolia.base.org

# Your DAO treasury wallet address (the account that receives all fees)
# This is the separate account you already created
DAO_TREASURY_ADDRESS=0xYOUR_DAO_TREASURY_WALLET_ADDRESS

# Basescan API key for contract verification
# Get it free at: https://basescan.org → Sign Up → API Keys → Add
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY

# Optional — for USD gas cost display in test reports
COINMARKETCAP_API_KEY=

# Set to "true" when you want a gas cost report
REPORT_GAS=false
```

**How to export your private key from MetaMask:**
```
MetaMask → Click account icon → Account Details → Show Private Key → Enter password → Copy
```

> ⚠️ Use a DEDICATED DEPLOYER WALLET with only testnet funds.
> Never use your main wallet's private key.

---

### STEP 5 — Get Base Sepolia Testnet ETH

Your deployer wallet needs ETH on Base Sepolia to pay for deployment gas.

**Faucets (free testnet ETH):**

1. **Coinbase Faucet (easiest):** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. **Alchemy Faucet:** https://www.alchemy.com/faucets/base-sepolia
3. **Superchain Faucet:** https://app.optimism.io/faucet

Request at least **0.5 ETH** — the 4 contract deployments cost approximately 0.02–0.05 ETH total.

**Verify your balance:**
```bash
# Check on Basescan
# Go to: https://sepolia.basescan.org/address/YOUR_DEPLOYER_ADDRESS
```

---

### STEP 6 — Compile the Contracts

```bash
npm run compile
```

What this does:
- Compiles all `.sol` files in `contracts/`
- Generates `artifacts/` with ABI + bytecode for each contract
- Generates `typechain-types/` with TypeScript bindings
- Uses Solidity `0.8.24` with optimizer (200 runs) + `viaIR: true`

**Expected output:**
```
Generating typings for: 15 artifacts in dir: typechain-types
Successfully generated 42 typings!
Compiled 15 Solidity files successfully (evm target: paris).
```

**If you get errors:**
```bash
# Clear cache and retry
npm run clean
npm run compile
```

---

### STEP 7 — Run All Tests

Tests run on a local in-memory Hardhat network — no RPC or funds needed.

```bash
npm test
```

**Run specific test suites:**
```bash
# Unit tests only (faster)
npm run test:unit

# Integration tests only
npm run test:integration

# Single test file
npx hardhat test test/unit/Staking.test.ts
npx hardhat test test/unit/Escrow.test.ts
npx hardhat test test/unit/Dispute.test.ts
npx hardhat test test/unit/Proposals.test.ts
npx hardhat test test/integration/EscrowDispute.test.ts
npx hardhat test test/integration/StakingProposals.test.ts
```

**Expected output (all passing):**
```
  FreelanceDAOStaking — Unit Tests
    Initialization
      ✓ sets owner correctly
      ✓ sets DAO treasury correctly
      ✓ reports correct minimum stake in wei for $1 at $3000/ETH
    stake()
      ✓ accepts a stake worth > $1 USD
      ✓ rejects stake below $1 USD minimum
      ...

  48 passing (12s)
```

**Run with gas report:**
```bash
REPORT_GAS=true npm test
# Generates: gas-report.txt
```

**Run coverage report:**
```bash
npm run test:coverage
# Opens: coverage/index.html
```

---

### STEP 8 — Lint Your Solidity Code

```bash
npm run lint:sol
```

This runs Solhint against all contracts using `.solhint.json` rules.

**Common warnings and what they mean:**

| Warning | Meaning | Action |
|---------|---------|--------|
| `func-visibility` | Function missing explicit visibility | Add `public`/`external`/`internal` |
| `ordering` | Functions not in recommended order | Reorder if needed |
| `reason-string` | Revert message > 64 chars | Shorten the string |
| `no-unused-vars` | Variable declared but not used | Remove it |

---

### STEP 9 — Static Analysis (Slither)

**Install Slither:**
```bash
pip3 install slither-analyzer --break-system-packages
```

**Verify installation:**
```bash
slither --version
# Expected: slither 0.10.x
```

**Run analysis:**
```bash
npm run slither
# or
bash scripts/slither.sh
```

Reports are saved to `reports/` as `.txt` and `.json` files.

**Understanding Slither severity levels:**

| Level | Meaning | Action |
|-------|---------|--------|
| `High` | Serious vulnerability | Must fix before any deployment |
| `Medium` | Potential issue | Review and fix if applicable |
| `Low` | Minor concern | Review, may be false positive |
| `Informational` | Code quality | Optional improvement |
| `Optimization` | Gas savings | Optional |

The script runs with `--exclude-informational --exclude-optimization` so you only see real findings.

**Expected known findings in this codebase and why they are safe:**

```
[Medium] reentrancy-eth in withdraw()
→ FALSE POSITIVE: ReentrancyGuard is applied. State updates before .call()

[Low] calls-loop in batchWithdraw()
→ ACKNOWLEDGED: Capped at MAX_BATCH_JOBS=20. Acceptable pattern.

[Informational] assembly usage
→ In test helpers only. Not in production contracts.
```

---

### STEP 10 — Static Analysis (Mythril)

**Install Mythril:**
```bash
pip3 install mythril --break-system-packages
```

**Verify installation:**
```bash
myth version
# Expected: Mythril version x.x.x
```

**Run analysis on all contracts (takes 30–60 min total):**
```bash
npm run mythril
# or
bash scripts/mythril.sh
```

**Run on a single contract (faster, 10–15 min):**
```bash
bash scripts/mythril.sh FreelanceDAOEscrowV2
bash scripts/mythril.sh FreelanceDAOStaking
bash scripts/mythril.sh FreelanceDAODisputeV2
bash scripts/mythril.sh FreelanceDAOProposals
```

Reports are saved to `reports/mythril/` as JSON files.

**Understanding Mythril SWC IDs:**

| SWC ID | Issue | Check |
|--------|-------|-------|
| SWC-107 | Reentrancy | Verify ReentrancyGuard is applied |
| SWC-101 | Integer Overflow | Verify Solidity 0.8.x (built-in checks) |
| SWC-104 | Unchecked Call Return | Verify `_safeSend()` checks `(bool ok, )` |
| SWC-115 | tx.origin auth | Should not be using tx.origin |
| SWC-116 | Block values for time | Acknowledged in deadline tracking |

> **Tip:** Mythril's `--execution-timeout 300` means 5 min per contract. For production
> before mainnet, increase to 600 or 900 for deeper analysis.

---

### STEP 11 — Deploy to Local Hardhat Node

This lets you test the deployment scripts locally before touching the real testnet.

**Terminal 1 — Start the local node:**
```bash
npm run node
```

You will see 20 test accounts printed with private keys and 10 000 ETH each.
Leave this terminal running.

**Terminal 2 — Deploy:**
```bash
npm run deploy:local
```

**Expected output:**
```
--- Deploying FreelanceDAOStaking (UUPS) ---
  Deploying MockV3Aggregator for local network...
  MockV3Aggregator deployed at 0x5FbDB...
  Proxy            : 0xe7f17...
  Implementation   : 0x9A676...

--- Deploying FreelanceDAOEscrowV2 (UUPS) ---
  Proxy            : 0xCf7Ed...
  Implementation   : 0xDc64a...

--- Deploying FreelanceDAODisputeV2 (UUPS) ---
  Proxy            : 0x5FC8d...
  Implementation   : 0x0165...

--- Deploying FreelanceDAOProposals (UUPS) ---
  Proxy            : 0xa513E...
  Implementation   : 0x2279...

--- Wiring cross-contract references ---
  Escrow.setDisputeContract(0x5FC8d...)
  Dispute.setEscrowContract(0xCf7Ed...)
  Staking.setProposalsContract(0xa513E...)

✅ All contracts wired successfully.

=== Deployment Summary ===
  FreelanceDAOStaking    : 0xe7f17...
  FreelanceDAOEscrowV2   : 0xCf7Ed...
  FreelanceDAODisputeV2  : 0x5FC8d...
  FreelanceDAOProposals  : 0xa513E...
```

Deployment records are saved to `deployments/localhost/`.

---

### STEP 12 — Deploy to Base Sepolia Testnet

Make sure you have completed Steps 4 and 5 (`.env` filled in, testnet ETH in deployer wallet).

```bash
npm run deploy:base-sepolia
```

The 5 deploy scripts run automatically in order:
```
00_deploy_staking.ts    → Deploys Staking proxy (uses real Chainlink feed)
01_deploy_escrow.ts     → Deploys Escrow proxy
02_deploy_dispute.ts    → Deploys Dispute proxy
03_deploy_proposals.ts  → Deploys Proposals proxy
04_wire_contracts.ts    → Wires all cross-contract addresses
```

**Deployment takes approximately 3–8 minutes** depending on network congestion.

Addresses are saved to `deployments/baseSepolia/`. Copy these — you need them for:
- Frontend integration
- Post-deployment setup (Step 13)
- Contract verification (Step 14)

**If a deployment fails mid-way:**
```bash
# hardhat-deploy is resumable — it skips already-deployed contracts
npm run deploy:base-sepolia
# It will pick up from where it failed
```

---

### STEP 13 — Post-Deployment Setup on Testnet

After contracts are deployed, you must configure them via on-chain transactions.
Use Hardhat console or a script.

**Open Hardhat console connected to Base Sepolia:**
```bash
npx hardhat console --network baseSepolia
```

**Inside the console:**
```javascript
// Load deployed contract addresses
const { deployments, ethers } = require("hardhat");

const disputeDep = await deployments.get("FreelanceDAODisputeV2");
const dispute = await ethers.getContractAt("FreelanceDAODisputeV2", disputeDep.address);

// 1. Add DAO members (repeat for each member)
await dispute.addDaoMember("0xDAOMEMBER_ADDRESS_1");
await dispute.addDaoMember("0xDAOMEMBER_ADDRESS_2");
await dispute.addDaoMember("0xDAOMEMBER_ADDRESS_3");
console.log("DAO members added");

// 2. Verify quorum is set (default is 3 — change if needed)
const quorum = await dispute.quorum();
console.log("Quorum:", quorum.toString()); // should be 3

// 3. Confirm treasury is correct on all contracts
const stakingDep = await deployments.get("FreelanceDAOStaking");
const staking = await ethers.getContractAt("FreelanceDAOStaking", stakingDep.address);
console.log("Staking treasury:", await staking.daoTreasury());

// 4. Test the price feed is working
const minStake = await staking.minimumStakeWei();
console.log("Min stake (wei):", minStake.toString());
// Should be roughly 333_333_333_333_333 (= 0.000333 ETH = $1 at $3000/ETH)
```

**Post-deployment checklist:**
```
[ ] At least 3 DAO members added to Dispute contract
[ ] All treasury addresses verified correct on all 4 contracts
[ ] Chainlink feed returning live prices (minimumStakeWei() returns non-zero)
[ ] Wiring verified (disputeContract on Escrow, escrowContract on Dispute, etc.)
[ ] Contracts verified on Basescan (Step 14)
[ ] Test stake → create MINOR proposal → vote → finalize (end-to-end smoke test)
[ ] Test create job → request → approve → deliver → confirm → withdraw
```

---

### STEP 14 — Verify Contracts on Basescan

Verification makes your contract source code publicly readable on https://sepolia.basescan.org.
This is important for trust and for users interacting with contracts directly.

**Run the verification script:**
```bash
npx hardhat run scripts/verify.ts --network baseSepolia
```

**Expected output:**
```
Verifying contracts on baseSepolia...

Verifying FreelanceDAOStaking at 0xe7f17...
  ✓ FreelanceDAOStaking verified

Verifying FreelanceDAOEscrowV2 at 0xCf7Ed...
  ✓ FreelanceDAOEscrowV2 verified

Verifying FreelanceDAODisputeV2 at 0x5FC8d...
  ✓ FreelanceDAODisputeV2 verified

Verifying FreelanceDAOProposals at 0xa513E...
  ✓ FreelanceDAOProposals verified
```

**If verification fails with "Already Verified":**
```
  ✓ FreelanceDAOStaking already verified   ← This is fine, ignore it
```

**If verification fails with API errors:**
```bash
# Wait 30 seconds after deployment before verifying — Basescan needs to index first
# Then retry:
npx hardhat run scripts/verify.ts --network baseSepolia
```

**Manually verify a single contract:**
```bash
npx hardhat verify --network baseSepolia <PROXY_ADDRESS>
```

---

### STEP 15 — Upgrading a Contract (UUPS)

When you need to fix a bug or add features, you upgrade the implementation
without changing the proxy address. Users never need to update their saved addresses.

**Rules you MUST follow before upgrading:**
1. Never remove a state variable
2. Never change the order of state variables
3. Only add new variables at the END of existing storage
4. The `__gap` array (50 slots) in each contract is your upgrade buffer
5. Always call `upgrades.validateUpgrade()` first

**Example: upgrading Staking to a new version:**

```typescript
// scripts/upgrade_staking.ts
import { ethers, upgrades } from "hardhat";
import { deployments } from "hardhat";

async function main() {
  // Get existing proxy address
  const dep = await deployments.get("FreelanceDAOStaking");
  console.log("Proxy address:", dep.address);

  // Validate storage compatibility BEFORE deploying
  const NewImpl = await ethers.getContractFactory("FreelanceDAOStakingV2");
  await upgrades.validateUpgrade(dep.address, NewImpl, { kind: "uups" });
  console.log("Storage validation passed ✓");

  // Upgrade
  const upgraded = await upgrades.upgradeProxy(dep.address, NewImpl, { kind: "uups" });
  await upgraded.waitForDeployment();

  const newImplAddr = await upgrades.erc1967.getImplementationAddress(dep.address);
  console.log("New implementation:", newImplAddr);
  console.log("Proxy unchanged:", dep.address);
}

main().catch(console.error);
```

```bash
npx hardhat run scripts/upgrade_staking.ts --network baseSepolia
```

---

## PART 4 — COMMON ERRORS & FIXES

### Error: "Cannot find module 'hardhat'"
```bash
# Node modules not installed
npm install
```

### Error: "HardhatError: Source file requires different compiler version"
```bash
# Wrong Solidity version referenced somewhere
# Open hardhat.config.ts and confirm: version: "0.8.24"
```

### Error: "Error: network baseSepolia not configured"
```bash
# Your .env is missing or PRIVATE_KEY is invalid
cat .env | grep PRIVATE_KEY
# Must be 64 hex characters with 0x prefix
```

### Error: "Error: insufficient funds for intrinsic transaction cost"
```bash
# Your deployer wallet has no Base Sepolia ETH
# Go get some from a faucet (Step 5)
```

### Error: "PriceConverter: stale price feed" in tests
```bash
# A test advanced blockchain time past 1 hour without updating the mock feed
# This is a test isolation issue — make sure tests use loadFixture() correctly
```

### Error: "Proposals: MAJOR requires >= $100 USD staked" unexpectedly
```bash
# The ETH price in your mock feed changed between tests
# Fixtures.ts sets MockV3Aggregator to $3,000/ETH
# $100 at $3,000/ETH = 0.0333 ETH — make sure your test stakes that amount
```

### Error: "Escrow: only dispute contract" when calling notifyDisputeCreated
```bash
# Wire script (04_wire_contracts.ts) didn't run or failed
# Manually set it:
await escrow.setDisputeContract(disputeAddress);
```

### Error: "Initializable: contract is already initialized"
```bash
# You called initialize() on an already-initialized proxy
# This is the protection working correctly — do not call initialize() twice
```

### Slither not found
```bash
pip3 install slither-analyzer --break-system-packages
# On some systems:
pip install slither-analyzer
```

### Mythril "solc not found" error
```bash
# Install the correct solc version
pip3 install solc-select --break-system-packages
solc-select install 0.8.24
solc-select use 0.8.24
```

---

## PART 5 — NPM SCRIPTS REFERENCE

| Command | What It Does |
|---------|-------------|
| `npm run compile` | Compile all contracts → artifacts + typechain |
| `npm test` | Run all tests (unit + integration) |
| `npm run test:unit` | Unit tests only (faster) |
| `npm run test:integration` | Integration tests only |
| `npm run test:coverage` | Tests + coverage report (coverage/index.html) |
| `npm run node` | Start local Hardhat node on port 8545 |
| `npm run deploy:local` | Deploy all contracts to local node |
| `npm run deploy:base-sepolia` | Deploy all contracts to Base Sepolia testnet |
| `npm run clean` | Delete artifacts/, cache/, typechain-types/ |
| `npm run slither` | Run Slither static analysis on all contracts |
| `npm run mythril` | Run Mythril symbolic execution on all contracts |
| `npm run lint:sol` | Solhint linting on all .sol files |
| `REPORT_GAS=true npm test` | Tests + gas cost table in USD |

---

## PART 6 — KEY ADDRESSES REFERENCE

### Base Sepolia (Testnet)

| Item | Address |
|------|---------|
| Chainlink ETH/USD Feed | `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb` |
| Chain ID | `84532` |
| Public RPC | `https://sepolia.base.org` |
| Basescan Explorer | `https://sepolia.basescan.org` |

### Base Mainnet (Future reference)

| Item | Address |
|------|---------|
| Chainlink ETH/USD Feed | `0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70` |
| Chain ID | `8453` |
| Public RPC | `https://mainnet.base.org` |
| Basescan Explorer | `https://basescan.org` |

> When going to mainnet: update the `ETH_USD_FEED` map in all 4 deploy scripts
> to use the mainnet feed address above.

---

## PART 7 — RECOMMENDED WORKFLOW SUMMARY

```
1. npm install                           ← Install dependencies
2. cp .env.example .env && fill values  ← Configure environment
3. npm run compile                       ← Compile contracts
4. npm test                              ← All tests must pass
5. npm run lint:sol                      ← Fix any lint warnings
6. npm run slither                       ← Review security findings
7. bash scripts/mythril.sh              ← Deep symbolic analysis (slow)
8. npm run node (Terminal 1)            ← Start local node
9. npm run deploy:local (Terminal 2)    ← Test deploy scripts
10. npm run deploy:base-sepolia          ← Deploy to real testnet
11. npx hardhat console --network ...   ← Post-deploy config (Step 13)
12. npx hardhat run scripts/verify.ts   ← Verify on Basescan
13. Manual smoke test on testnet        ← Verify end-to-end
14. Frontend integration                 ← Connect the UI
```