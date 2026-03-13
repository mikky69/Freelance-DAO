# FreeLanceDAO — Smart Contracts V2

> **Blockchain:** Base (Sepolia Testnet)  
> **Currency:** ETH (migrated from HBAR/Hedera)  
> **Solidity:** `^0.8.24`  
> **Framework:** Hardhat + OpenZeppelin v5 (UUPS Upgradeable)  
> **Oracle:** Chainlink ETH/USD Price Feed  

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Contract Summaries](#contract-summaries)
4. [Cross-Contract Communication](#cross-contract-communication)
5. [Proposal Tiers](#proposal-tiers)
6. [Fee Structure](#fee-structure)
7. [Chainlink Price Oracle](#chainlink-price-oracle)
8. [Project Structure](#project-structure)
9. [Setup & Installation](#setup--installation)
10. [Environment Variables](#environment-variables)
11. [Compile](#compile)
12. [Testing](#testing)
13. [Deployment](#deployment)
14. [Static Analysis](#static-analysis)
15. [Contract Verification](#contract-verification)
16. [Upgrade Guide (UUPS)](#upgrade-guide-uups)
17. [Security Considerations](#security-considerations)
18. [Network Config Reference](#network-config-reference)

---

## Overview

FreeLanceDAO is a decentralised freelancing platform built on **Base blockchain**. It enables:

- **Clients** to post fixed-price or milestone-based jobs, escrow ETH, and confirm delivery.
- **Freelancers** to apply for jobs, mark deliveries, and withdraw earnings with platform fees deducted at withdrawal time.
- **DAO Members** to vote on disputes that cannot be auto-resolved.
- **Stakers** to lock ETH and gain governance power — required to create proposals or vote.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ESCROW CLUSTER                          │
│                                                                 │
│   FreelanceDAOEscrowV2  ◄──────────────►  FreelanceDAODisputeV2│
│   (jobs, payments,       notifyDispute     (voting, resolution, │
│    withdrawals,          notifyResolved     dynamic fees)       │
│    fee collection)                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       GOVERNANCE CLUSTER                        │
│                                                                 │
│   FreelanceDAOStaking  ◄───────────────►  FreelanceDAOProposals│
│   (ETH staking,         onStakeChanged    (MINOR/MAJOR tiers,  │
│    governance power,    ← stake weight    weighted voting,      │
│    Chainlink $1 min)                      Chainlink $100 gate) │
└─────────────────────────────────────────────────────────────────┘

                    Both clusters use:
         ┌──────────────────────────────────────┐
         │  Chainlink ETH/USD AggregatorV3      │
         │  Base Sepolia: 0x4aDC67696bA383F4... │
         │  Staleness check: reject > 1 hour    │
         └──────────────────────────────────────┘
```

---

## Contract Summaries

### `FreelanceDAOStaking`
- Users stake ETH to gain governance power (voting weight and proposal eligibility).
- **Minimum stake:** dynamically enforced — must be worth ≥ **$1 USD** at current ETH/USD price (Chainlink).
- No yield/reward model — pure governance staking.
- Notifies the Proposals contract on every stake/unstake via `IProposals.onStakeChanged()`.
- Stakers can optionally register metadata (type, description, tags).

### `FreelanceDAOProposals`
- Two proposal tiers gated by staked ETH value at creation time:

  | Tier  | Required Stake | Who Can Create     |
  |-------|----------------|--------------------|
  | MINOR | ≥ $1 USD staked  | Any active staker  |
  | MAJOR | ≥ $100 USD staked | High-commitment stakers |

- Voting is **stake-weighted** — vote weight = ETH staked at time of first vote (snapshot).
- Voting power snapshot is **immutable** — unstaking after voting does not reduce recorded votes.
- Quorum is configurable by the owner (in wei, total yes + no must meet threshold).
- Fee-optional: any ETH sent with `createProposal()` is forwarded to DAO treasury.

### `FreelanceDAOEscrowV2`
- Supports **Fixed** and **Milestone** job types.
- Escrows ETH from client at job creation; fees are deducted only at withdrawal.
- Full job lifecycle: `OPEN → PENDING → DELIVERY → CONFIRMED → withdrawn`.
- Communicates with Dispute contract: receives `notifyDisputeCreated` and `notifyDisputeResolved` from the Dispute contract only.
- Batch withdrawal supports up to **20 jobs** per transaction (gas safety cap).

### `FreelanceDAODisputeV2`
- Dispute creation fee is **dynamic** — always ≈ **$0.34 USD** in ETH (Chainlink-priced).
- Four dispute reasons: `LATE_DELIVERY`, `REFUND_REQUEST`, `QUALITY_ISSUE`, `OTHER`.
- `LATE_DELIVERY` → auto-resolved (no DAO vote needed, 7% penalty applied on Escrow side).
- All other types → require DAO member votes; quorum = 3 by default (configurable).
- Tie votes → dispute marked `REJECTED` (no action taken on escrow).
- All fees forwarded to DAO treasury on dispute creation.

---

## Cross-Contract Communication

### Escrow ↔ Dispute (Dispute Cluster)

```
Client calls createDispute()
        │
        ▼
FreelanceDAODisputeV2
  └── IEscrow(escrow).notifyDisputeCreated(jobId, disputeId, reason)
        │
        ▼
FreelanceDAOEscrowV2
  └── Sets job.status = DISPUTED
  └── If LATE_DELIVERY + job.isLate → sets lateDeliveryPenalty = true

After DAO votes reach quorum (or autoResolve called):
FreelanceDAODisputeV2._resolveDispute()
  └── IEscrow(escrow).notifyDisputeResolved(jobId, disputeId, reason, winner)
        │
        ▼
FreelanceDAOEscrowV2
  └── Executes refund (client wins) or confirms payment (freelancer wins)
```

### Staking ↔ Proposals (Governance Cluster)

```
User calls stake() or unstake()
        │
        ▼
FreelanceDAOStaking
  └── IProposals(proposals).onStakeChanged(user, newStakedWei)
        │
        ▼
FreelanceDAOProposals
  └── Emits StakeChangedNotified (off-chain monitoring hook)
  └── Future proposal creation re-evaluated at creation time via live Staking query

User calls createProposal(MAJOR, ...)
        │
        ▼
FreelanceDAOProposals
  └── IStaking(staking).getStakedAmount(msg.sender)
  └── PriceConverter.weiToUSD(stakedWei, priceFeed)
  └── Reverts if < $100 USD staked

User calls vote(proposalId, support)
        │
        ▼
FreelanceDAOProposals
  └── IStaking(staking).getStakedAmount(msg.sender)
  └── Snapshots weight — immutable for this proposal
```

---

## Proposal Tiers

| Feature                    | MINOR Proposal             | MAJOR Proposal              |
|----------------------------|----------------------------|-----------------------------|
| Required stake             | ≥ $1 USD in ETH            | ≥ $100 USD in ETH           |
| Stake evaluation           | Live Chainlink price feed  | Live Chainlink price feed   |
| Example at $3 000/ETH      | ≥ 0.000333 ETH             | ≥ 0.0333 ETH                |
| Voting weight              | ETH staked (snapshot)      | ETH staked (snapshot)       |
| Voting period              | 3 days (owner-configurable)| 3 days (owner-configurable) |
| Execution                  | Signalling only (off-chain)| Signalling only (off-chain) |

> **Note:** Proposals are signalling-only in V2 — the DAO acts on approved proposals off-chain. On-chain execution modules can be added in V3.

---

## Fee Structure

All fees accumulate in `totalDaoFeesCollected` on the Escrow contract and are sent to the **DAO Treasury** when the owner calls `withdrawDaoFees()`.

| Scenario                                | Fee  | Applied On         |
|-----------------------------------------|------|--------------------|
| Normal job completion (fixed or milestone, all confirmed) | 5%   | At withdrawal      |
| Late delivery (dispute upheld)          | 7%   | At withdrawal      |
| Early milestone withdrawal (not all confirmed) | 10%  | At withdrawal      |
| Dispute creation fee                    | ≈ $0.34 USD in ETH | At dispute creation → treasury immediately |

---

## Chainlink Price Oracle

| Contract              | Uses Chainlink For                                      |
|-----------------------|---------------------------------------------------------|
| `FreelanceDAOStaking` | Enforce $1 USD minimum stake                           |
| `FreelanceDAOProposals` | Enforce $1 / $100 USD tier gates                     |
| `FreelanceDAODisputeV2` | Dynamic dispute fee ≈ $0.34 USD                    |
| `PriceConverter` lib  | Shared `weiToUSD()` and `usdToWei()` helpers           |

**Staleness protection:** All price feed reads reject data older than **1 hour**. If the feed is stale, transactions that need pricing will revert with `"PriceConverter: stale price feed"`.

**Base Sepolia feed address:** `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb` (ETH/USD, 8 decimals)

---

## Project Structure

```
base-smart-contracts/
│
├──contracts/
│   ├── interfaces/
│   │   ├── IEscrow.sol               ← Dispute → Escrow callbacks
│   │   ├── IDisputeResolution.sol    ← Escrow queries dispute outcomes
│   │   ├── IStaking.sol              ← Proposals queries staking data
│   │   └── IProposals.sol            ← Staking notifies proposals
│   │
│   ├── libraries/
│   │   ├── DataTypes.sol             ← Shared enums (DisputeReason, ProposalTier, etc.)
│   │   ├── FeeCalculator.sol         ← Pure fee math (5%, 7%, 10%)
│   │   └── PriceConverter.sol        ← Chainlink ETH/USD helpers
│   │
│   ├── mocks/
│   │   └── MockV3Aggregator.sol      ← Chainlink mock for local tests
│   │
│   ├── FreelanceDAOStaking.sol       ← ETH staking + governance power
│   ├── FreelanceDAOProposals.sol     ← MINOR/MAJOR proposals + weighted voting
│   ├── FreelanceDAOEscrowV2.sol      ← Fixed & milestone job escrow
│   └── FreelanceDAODisputeV2.sol     ← DAO dispute resolution
│
├── deploy/
│   ├── 00_deploy_staking.ts          ← Deploy Staking proxy
│   ├── 01_deploy_escrow.ts           ← Deploy Escrow proxy
│   ├── 02_deploy_dispute.ts          ← Deploy Dispute proxy (depends on 00)
│   ├── 03_deploy_proposals.ts        ← Deploy Proposals proxy (depends on 00)
│   └── 04_wire_contracts.ts          ← Wire all cross-contract addresses
│
├── test/
│   ├── helpers/
│   │   └── fixtures.ts               ← Shared deploy helpers & test utils
│   ├── unit/
│   │   ├── Staking.test.ts
│   │   ├── Proposals.test.ts
│   │   ├── Escrow.test.ts
│   │   └── Dispute.test.ts
│   └── integration/
│       ├── EscrowDispute.test.ts     ← Full Escrow ↔ Dispute flows
│       └── StakingProposals.test.ts  ← Full Staking ↔ Proposals flows
│
├── scripts/
│   ├── slither.sh                    ← Slither static analysis
│   ├── mythril.sh                    ← Mythril symbolic execution
│   └── verify.ts                     ← Basescan contract verification
│
├── reports/                          ← Generated by analysis scripts (gitignored)
├── hardhat.config.ts
├── tsconfig.json
├── package.json
├── mythril-solc.json                 ← Mythril remapping config
├── .solhint.json                     ← Solidity linter config
├── .env.example                      ← Environment template
├── .gitignore
└── README.md
```

---

## Setup & Installation

### Prerequisites

| Tool        | Version     | Install                                   |
|-------------|-------------|-------------------------------------------|
| Node.js     | ≥ 18.x      | [nodejs.org](https://nodejs.org)          |
| npm         | ≥ 9.x       | Bundled with Node                         |
| Python      | ≥ 3.10      | For Slither & Mythril                     |
| Git         | any         | [git-scm.com](https://git-scm.com)        |

### Install

```bash
git clone https://github.com/mikky69/Freelance-DAO.git
cd Freelance-DAO
npm install
```

### Install Static Analysis Tools (optional but recommended)

```bash
# Slither
pip install slither-analyzer --break-system-packages

# Mythril  
pip install mythril --break-system-packages

# Solhint (already in devDependencies — but can also install globally)
npm install -g solhint
```

---

## Environment Variables

Copy the template and fill in your values:

```bash
cp .env.example .env
```

| Variable                    | Required | Description                                           |
|-----------------------------|----------|-------------------------------------------------------|
| `PRIVATE_KEY`               | ✅       | Deployer private key (with 0x prefix)                 |
| `BASE_SEPOLIA_RPC`          | ✅       | RPC URL (e.g. from Alchemy or Infura)                 |
| `BASESCAN_API_KEY`          | ✅       | For contract verification on Basescan                 |
| `DAO_TREASURY_ADDRESS`      | ✅       | Your pre-created DAO treasury wallet address          |
| `COINMARKETCAP_API_KEY`     | ❌       | Optional — for USD gas cost reporting                 |
| `REPORT_GAS`                | ❌       | Set to `"true"` to print gas report after tests       |

> ⚠️ **Never commit your `.env` file.** It is gitignored by default.

---

## Compile

```bash
npm run compile
```

This runs `hardhat compile` and generates:
- `artifacts/` — contract ABIs and bytecode
- `typechain-types/` — fully typed TypeScript bindings

---

## Testing

### Run all tests

```bash
npm test
```

### Run unit tests only

```bash
npm run test:unit
```

### Run integration tests only

```bash
npm run test:integration
```

### Run with gas report

```bash
REPORT_GAS=true npm test
```

### Run with coverage

```bash
npm run test:coverage
```

Coverage report will be in `coverage/index.html`.

### What is tested

| Test File                          | Coverage                                                   |
|------------------------------------|------------------------------------------------------------|
| `unit/Staking.test.ts`             | Stake, unstake, USD minimum, metadata, pagination, admin   |
| `unit/Proposals.test.ts`           | MINOR/MAJOR gating, voting, finalization, onStakeChanged   |
| `unit/Escrow.test.ts`              | Fixed/milestone lifecycle, fees, batch withdraw, cancel    |
| `unit/Dispute.test.ts`             | Creation, DAO voting, auto-resolve, dynamic fee, pagination|
| `integration/EscrowDispute.test.ts`| Full dispute flows: lock → vote → resolve → refund/pay     |
| `integration/StakingProposals.test.ts` | Stake gates, cross-contract notifications, voting weight |

---

## Deployment

### Local (Hardhat node)

```bash
# Terminal 1 — start local node
npm run node

# Terminal 2 — deploy all contracts
npm run deploy:local
```

### Base Sepolia Testnet

1. Fund your deployer wallet with Base Sepolia ETH (use [Base Sepolia faucet](https://docs.base.org/docs/tools/network-faucets)).
2. Set all required variables in `.env`.
3. Deploy:

```bash
npm run deploy:base-sepolia
```

The deploy scripts run in order automatically:

```
00_deploy_staking.ts    → Staking proxy
01_deploy_escrow.ts     → Escrow proxy  
02_deploy_dispute.ts    → Dispute proxy
03_deploy_proposals.ts  → Proposals proxy
04_wire_contracts.ts    → Cross-contract wiring
```

Deployment addresses are saved to `deployments/baseSepolia/`.

### Post-Deployment Checklist

After deploying to Base Sepolia, complete these steps:

- [ ] Add initial DAO members via `dispute.addDaoMember(address)`
- [ ] Confirm DAO treasury address is set on all 4 contracts
- [ ] Set quorum on Dispute contract (default: 3)
- [ ] Set quorum on Proposals contract if needed
- [ ] Verify all contracts on Basescan (see below)
- [ ] Test a full job creation → delivery → withdrawal flow on testnet

---

## Static Analysis

### Slither

```bash
# Analyse all contracts
npm run slither

# Or run directly
bash scripts/slither.sh
```

Reports saved to `reports/slither_<ContractName>_<timestamp>.txt`.

Common Slither findings and their status in this codebase:

| Finding Type                  | Status         | Notes                                           |
|-------------------------------|----------------|-------------------------------------------------|
| Reentrancy                    | ✅ Mitigated   | `ReentrancyGuardUpgradeable` on all state-changing functions |
| Unbounded loops               | ✅ Mitigated   | All loops replaced with paginated getters        |
| Arbitrary `call` to user addr | ✅ Mitigated   | Only to `msg.sender`, `j.client`, `j.freelancer` |
| UUPS upgrade authority        | ✅ Secured     | `_authorizeUpgrade` guarded by `onlyOwner`       |
| Chainlink staleness           | ✅ Mitigated   | 1-hour staleness check in `PriceConverter`       |

### Mythril

```bash
# Analyse all contracts (takes 10–30 min each)
npm run mythril

# Analyse a single contract
bash scripts/mythril.sh FreelanceDAOEscrowV2
```

Reports saved to `reports/mythril/<ContractName>_<timestamp>.json`.

> **Tip:** Run Mythril overnight or increase `TIMEOUT` in `scripts/mythril.sh` for deeper analysis.

---

## Contract Verification

After deploying to Base Sepolia, verify all contracts on Basescan:

```bash
npx hardhat run scripts/verify.ts --network baseSepolia
```

UUPS proxies consist of two on-chain contracts — the **proxy** and the **implementation**. Both are verified automatically by `@openzeppelin/hardhat-upgrades` when you run the verify script.

Manual single-contract verification:

```bash
npx hardhat verify --network baseSepolia <PROXY_ADDRESS>
```

---

## Upgrade Guide (UUPS)

All 4 contracts are UUPS-upgradeable. Only the **owner** (EOA) can authorise upgrades.

### Upgrade a single contract

```bash
# Example: upgrade Staking to a new implementation
npx hardhat run - << 'EOF'
import { ethers, upgrades } from "hardhat";
import { deployments } from "hardhat";

async function main() {
  const dep = await deployments.get("FreelanceDAOStaking");
  const NewImpl = await ethers.getContractFactory("FreelanceDAOStakingV3");
  const upgraded = await upgrades.upgradeProxy(dep.address, NewImpl, { kind: "uups" });
  console.log("Upgraded at:", await upgraded.getAddress());
}
main();
EOF
```

### Rules for safe upgrades

1. **Never remove or reorder state variables.** Only append new ones.
2. The `__gap` array (50 slots) in each contract reserves upgrade space.
3. Call `upgrades.validateUpgrade()` before deploying a new implementation.
4. The `_disableInitializers()` in each constructor prevents implementation contract hijacking.

---

## Security Considerations

| Risk                        | Mitigation                                                           |
|-----------------------------|----------------------------------------------------------------------|
| Reentrancy                  | `ReentrancyGuardUpgradeable` on all ETH-transferring functions      |
| Stale oracle data           | 1-hour staleness check; reverts if stale                            |
| Unauthorised upgrade        | `_authorizeUpgrade` restricted to `onlyOwner`                       |
| Implementation hijacking    | `_disableInitializers()` in all constructors                        |
| Unbounded gas loops         | All `getAllX()` functions replaced with paginated variants           |
| Batch withdraw gas bomb     | `MAX_BATCH_JOBS = 20` hard cap on batch withdrawals                 |
| Cross-contract caller faking| `require(msg.sender == disputeContract / escrowContract / stakingContractAddress)` |
| Fee exceeding amount        | `FeeCalculator.calculateNet()` reverts if `fee > amount`           |
| ETH transfer failure        | `_safeSend()` checks `(bool ok, )` and reverts on failure           |
| Proposal tier bypass        | Tier checked at creation time with live Chainlink price             |

---

## Network Config Reference

| Network       | Chain ID | RPC                            | Explorer                              |
|---------------|----------|--------------------------------|---------------------------------------|
| Base Sepolia  | 84532    | `https://sepolia.base.org`     | `https://sepolia.basescan.org`        |
| Base Mainnet  | 8453     | `https://mainnet.base.org`     | `https://basescan.org`                |
| Hardhat local | 31337    | `http://127.0.0.1:8545`        | N/A                                   |

### Chainlink Feeds (ETH/USD)

| Network       | Feed Address                                   |
|---------------|------------------------------------------------|
| Base Sepolia  | `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb`   |
| Base Mainnet  | `0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70`  |

> When deploying to Base Mainnet, update the `ETH_USD_FEED` map in each deploy script to use the mainnet feed address.

---

## Author

**John Kenechukwu (Asmodeus)**  
FreeLanceDAO — V2 | Base Blockchain Migration

---

*This project is on testnet. Do not use with real funds until a full audit has been completed.*