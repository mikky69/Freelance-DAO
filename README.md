# FreeLanceDAO

> A decentralized freelance platform combining Web2 familiarity with Web3 automation and governance on Hedera Hashgraph.

![freelance bw logo](https://github.com/user-attachments/assets/51177391-8ea2-4fc8-b2e9-bde47a87240a)

<div align="center">
  <h2>🚀 The Future of Freelancing is Decentralized</h2>
  <p>Built on Hedera for enterprise-grade security, speed, and sustainability</p>
  
  **Track:** DeFi & Financial Inclusion
</div>

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Hedera Integration Summary](#-hedera-integration-summary)
- [Architecture Diagram](#-architecture-diagram)
- [Deployed Hedera IDs](#-deployed-hedera-ids)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Key Features](#-key-features)
- [Team Certification](#-team-certification)
- [Pitch Deck](#-pitch-deck)
- [Contributing](#-contributing)

---

## 🌟 Overview

FreeLanceDAO revolutionizes the freelance economy by addressing critical pain points in traditional platforms: high fees (20-30% on Upwork/Fiverr), slow payment processing, and exploitative practices. Our platform leverages Hedera's distributed ledger technology to create a transparent, fair, and efficient marketplace connecting clients with top-tier talent globally, while reducing transaction costs by 85% and enabling instant, trustless payments.

### The Problem
- **Expensive & Exploitative:** Traditional platforms charge 20-30% fees
- **Slow & Inefficient:** Payment delays of 14-30 days
- **Lack of Trust:** Opaque dispute resolution and rating systems
- **Limited Innovation:** No AI integration or scalable workforce solutions

### Our Solution
- **Low-Cost Transactions:** Hedera's predictable micro-fees ($0.0001 per transaction)
- **Instant Payments:** 3-5 second finality with aBFT consensus
- **Transparent Governance:** DAO-based decision making with $FDAO token
- **AI Workforce Integration:** Hybrid human-AI freelance marketplace
- **Fair Economics:** Only 5% platform fee with lifetime royalties for AI agent creators

---

## 🔗 Hedera Integration Summary

### Why Hedera for FreeLanceDAO?

We chose Hedera Hashgraph as our foundational infrastructure because it uniquely addresses the core challenges of building a scalable, cost-effective freelance platform for emerging markets. Traditional blockchain networks impose prohibitive costs and unpredictable fees that make micro-transactions economically unviable. Hedera's architecture solves this.

### 1. Hedera Smart Contract Service (HSCS)

**Why HSCS:** We deployed four core smart contracts on HSCS to automate trust-critical operations without intermediaries. Unlike Ethereum's unpredictable gas fees that can spike to $50+ during congestion, Hedera's fixed pricing model ($0.0367 per contract call) ensures our escrow, staking, proposals, and dispute resolution remain affordable even for small $10-50 freelance jobs common in African markets.

**Transaction Types:**
- `ContractCreateTransaction` - Deployed 4 smart contracts (escrow, staking, governance, disputes)
- `ContractExecuteTransaction` - Execute escrow deposits, withdrawals, staking operations, proposal voting, and dispute resolutions
- `ContractCallQuery` - Query contract state (job status, stake balances, proposal results, dispute outcomes)

**Economic Justification:** 
With predictable $0.0367 per contract execution, we can guarantee freelancers earning $20 per job only lose $0.04 (<0.2%) to blockchain operations versus $4-6 (20-30%) on traditional platforms. This 150x cost reduction is essential for financial inclusion in price-sensitive markets. Additionally, Hedera's 10,000+ TPS throughput ensures we can scale to 100,000+ daily transactions without performance degradation—critical for serving Africa's 50M+ freelance workforce.

**Smart Contracts Deployed:**
- Payment Escrow: `0.0.7158715`
- Staking: `0.0.6889307`
- Governance Proposals: `0.0.6922488`
- Dispute Resolution: `0.0.6920314`

### 2. Hedera Token Service (HTS)

**Why HTS:** We leverage HTS to issue our native $FDAO governance token and enable multi-currency payments ($HBAR, $USDC). Creating custom tokens on Ethereum costs $100-500 in gas fees and requires complex ERC-20 contracts. HTS provides native tokenization for just $1, making it 500x cheaper to bootstrap our token economy. This cost efficiency allows us to allocate more resources to user acquisition and platform development.

**Transaction Types:**
- `TokenCreateTransaction` - Create $FDAO governance token and enable USDC payments
- `TokenAssociateTransaction` - Associate tokens with user accounts
- `TransferTransaction` - Execute $FDAO transfers for rewards, staking, and governance
- `TokenMintTransaction` - Mint $FDAO tokens for DAO treasury and community rewards

**Economic Justification:**
HTS enables us to offer instant cross-border payments with $0.0001 transaction fees versus $15-45 for international wire transfers or 3-7% for traditional payment processors. For a Nigerian freelancer receiving $500 from a US client, this represents $14.99 in savings per transaction. Annually, this could save our user base millions in remittance fees, directly supporting financial inclusion goals. The native compliance features also simplify KYC/AML requirements for institutional adoption.

### 3. Hedera Consensus Service (HCS)

**Why HCS:** We use HCS to create immutable, timestamped audit trails of all platform activities—job postings, applications, milestone completions, reviews, and governance votes. This transparency is critical for building trust in markets where fraud and platform manipulation are common concerns. At $0.0001 per message, we can afford to log every platform action, creating unprecedented accountability that traditional platforms cannot economically provide.

**Transaction Types:**
- `TopicCreateTransaction` - Create topics for different activity streams (jobs, reviews, governance, disputes)
- `TopicMessageSubmitTransaction` - Log all platform events immutably
- `TopicMessageQuery` - Retrieve historical activity via Mirror Nodes

**Economic Justification:**
Immutable logging builds user trust essential for platform adoption. In regions with weak legal frameworks, HCS provides cryptographic proof of work agreements, payments, and outcomes—effectively a "blockchain notary" costing $0.0001 versus $50-200 for traditional notarization. This enables micro-contracts (sub-$100 jobs) to have the same legal verifiability as enterprise contracts, democratizing access to secure digital work agreements. The timestamped, ordered nature of HCS also prevents front-running and manipulation in our governance system.

**Topics:**
- Job Activity Stream 
- Review & Reputation 
- Governance Votes 
- Dispute Logs

### 4. Hedera File Service (HFS)

**Why HFS:** We use HFS to store smart contract bytecode and critical configuration files on-chain. This ensures contract immutability and creates a verifiable record of contract deployments. Combined with IPFS for large file storage (portfolios, work samples), HFS provides the anchoring layer that guarantees content integrity—essential for a platform where reputation and work history are core assets.

**Transaction Types:**
- `FileCreateTransaction` - Store smart contract bytecode
- `FileAppendTransaction` - Append data to existing files
- `FileUpdateTransaction` - Update file contents (admin only, logged for transparency)

**Economic Justification:**
Decentralized storage prevents censorship and ensures freelancer portfolios remain accessible even if platform operators change. At $0.05 per KB, storing a typical smart contract (50KB) costs $2.50 versus $500+ for equivalent permanent storage on Ethereum. This 200x reduction enables us to store all platform governance decisions and critical data on-chain, ensuring true decentralization without prohibitive costs.

---

## 🏗 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (localhost:3000)                       │  │
│  │  - React Components - Tailwind CSS - HashPack Wallet    │  │
│  └────────────┬───────────────────────────┬─────────────────┘  │
│               │                           │                     │
└───────────────┼───────────────────────────┼─────────────────────┘
                │                           │
                │ Web3 Calls                │ API Requests
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌──────────────────────────────┐
│   HEDERA NETWORK          │   │   BACKEND SERVER             │
│   (Testnet)               │   │   Node.js + Express          │
│                           │   │   (localhost:5000)           │
│  ┌────────────────────┐   │   │                              │
│  │ Smart Contracts    │   │   │  ┌────────────────────────┐  │
│  │ (HSCS)             │◄──┼───┼──┤ tRPC API Layer         │  │
│  │ - Escrow           │   │   │  └────────────────────────┘  │
│  │ - Staking          │   │   │  ┌────────────────────────┐  │
│  │ - Proposals        │   │   │  │ PostgreSQL + Prisma    │  │
│  │ - Disputes         │   │   │  │ (Off-chain data)       │  │
│  └────────────────────┘   │   │  └────────────────────────┘  │
│                           │   │                              │
│  ┌────────────────────┐   │   │  ┌────────────────────────┐  │
│  │ Token Service      │◄──┼───┼──┤ NextAuth.js +          │  │
│  │ (HTS)              │   │   │  │ Hedera DID Auth        │  │
│  │ - $FDAO Token      │   │   │  └────────────────────────┘  │
│  │ - $USDC Payments   │   │   │                              │
│  └────────────────────┘   │   └──────────────────────────────┘
│                           │                │
│  ┌────────────────────┐   │                │
│  │ Consensus Service  │◄──┼────────────────┘
│  │ (HCS)              │   │      Activity Logs
│  │ - Job Logs         │   │      (Jobs, Reviews, Votes)
│  │ - Review Logs      │   │
│  │ - Governance Logs  │   │
│  └────────────────────┘   │
│                           │
│  ┌────────────────────┐   │
│  │ File Service       │◄──┼─── Contract Bytecode
│  │ (HFS)              │   │     Config Files
│  └────────────────────┘   │
│           │               │
└───────────┼───────────────┘
            │
            ▼
┌───────────────────────────┐
│   HEDERA MIRROR NODES     │
│   - Transaction History   │
│   - State Queries         │
│   - HCS Message Retrieval │
└───────────────────────────┘
            │
            ▼
     ┌─────────────┐
     │   IPFS      │
     │  (Storage)  │
     │  Portfolios │
     │  Documents  │
     └─────────────┘

DATA FLOW:
1. User authenticates via HashPack Wallet → Frontend
2. Frontend sends job creation → Backend API validates
3. Backend logs activity to HCS Topic → Hedera Network
4. User deposits payment → HSCS Escrow Contract → Hedera
5. Milestone completion → Backend verifies → Contract releases funds
6. Review submission → HCS logs review → Updates reputation
7. Governance voting → Frontend → HSCS Proposals Contract
8. All queries → Mirror Nodes for historical data
```

---

## 🆔 Deployed Hedera IDs

### Hedera Testnet Deployment

**Smart Contracts (HSCS):**
- Payment Escrow Contract: `0.0.7158715`
- Staking Contract: `0.0.6889307`
- Governance Proposals Contract: `0.0.6922488`
- Dispute Resolution Contract: `0.0.6920314`

**Tokens (HTS):**
- $FDAO Governance Token: `0.0.XXXXXX` (to be created)
- USDC Payment Token: `0.0.XXXXXX` (testnet USDC association)


---

## 🛠 Technology Stack

### Blockchain & Web3
- **Hedera Hashgraph:** HCS, HTS, HSCS, HFS
- **Smart Contracts:** Solidity 0.8.x
- **Wallets:** HashPack, Blade Wallet integration
- **Hedera SDK:** @hashgraph/sdk v2.x

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS, Shadcn/ui
- **State Management:** React Query, Zustand
- **Web3 Integration:** Hedera SDK + Wallet Connect

### Backend
- **Runtime:** Node.js 20+, TypeScript
- **API Framework:** tRPC, Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with Hedera DID
- **Real-time:** WebSockets for live updates

### Storage & Indexing
- **Decentralized Storage:** IPFS + Hedera File Service
- **Indexing:** Hedera Mirror Node REST API
- **Caching:** Redis for performance optimization

### Development Tools
- **Linting:** ESLint, Prettier
- **Testing:** Jest, React Testing Library
- **Version Control:** Git, GitHub
- **CI/CD:** GitHub Actions (planned)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Hedera Testnet Account** ([Create free account](https://portal.hedera.com/))
- **HashPack Wallet** or **Blade Wallet** ([HashPack](https://www.hashpack.app/))

### Deployment & Setup Instructions

#### Step 1: Clone the Repository
```bash
git clone https://github.com/mikky69/Freelance-DAO.git
cd Freelance-DAO
```

#### Step 2: Install Dependencies
```bash
# Install all project dependencies
npm install

# Or if you prefer yarn
yarn install
```

#### Step 3: Configure Environment Variables

1. Create a `.env.local` file from the example:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your configuration (see `.env.example` for structure):

```env
# Hedera Network Configuration (Testnet)
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# Deployed Smart Contract IDs
ESCROW_CONTRACT_ID=0.0.7158715
STAKING_CONTRACT_ID=0.0.6889307
PROPOSALS_CONTRACT_ID=0.0.6922488
DISPUTE_CONTRACT_ID=0.0.6920314

# HTS Token IDs (update after token creation)
FDAO_TOKEN_ID=0.0.XXXXXX
USDC_TOKEN_ID=0.0.XXXXXX

# HCS Topic IDs (update after topic creation)
JOBS_TOPIC_ID=0.0.XXXXXX
REVIEWS_TOPIC_ID=0.0.XXXXXX
GOVERNANCE_TOPIC_ID=0.0.XXXXXX
DISPUTES_TOPIC_ID=0.0.XXXXXX

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/freelancedao

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# IPFS Configuration (optional)
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_API_URL=http://localhost:5000
```

**⚠️ CRITICAL SECURITY NOTE:**
- **NEVER commit `.env.local` or any file containing private keys to Git**
- The `.env.example` file contains only placeholders
- Keep your `HEDERA_PRIVATE_KEY` secure and never share it

#### Step 4: Set Up Database

1. Create a PostgreSQL database:
```bash
createdb freelancedao
```

2. Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

3. (Optional) Seed initial data:
```bash
npm run db:seed
```

#### Step 5: Deploy Smart Contracts (if needed)

If you need to redeploy contracts:
```bash
cd smart-contracts
npm run deploy:testnet
```

This will output new contract IDs. Update your `.env.local` accordingly.

#### Step 6: Run the Application

**Terminal 1 - Start the Backend Server:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Start the Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

**Terminal 3 - (Optional) Start Database Studio:**
```bash
npx prisma studio
# Prisma Studio runs on http://localhost:5555
```

#### Step 7: Access the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Connect your HashPack or Blade Wallet (set to Hedera Testnet)
3. Request testnet HBAR from the [Hedera Faucet](https://portal.hedera.com/faucet)
4. Start exploring FreeLanceDAO!

### Running Environment

**Expected Local Running State:**
- **Frontend:** `http://localhost:3000` (Next.js)
- **Backend API:** `http://localhost:5000` (Node.js/Express)
- **Database Studio:** `http://localhost:5555` (Prisma Studio - optional)
- **Network:** Hedera Testnet

### Judge Credentials & Testing

**For Hackathon Judges:**

To test the platform, you can use the following test credentials provided in the DoraHacks submission notes:

- **Test Account ID:** Provided in DoraHacks submission text field
- **Test Private Key:** Provided in DoraHacks submission text field
- **Test Wallet:** HashPack wallet with testnet HBAR pre-funded

**Testing Workflow:**
1. Connect with provided test wallet
2. Browse existing jobs or create a test job
3. Apply to jobs as a freelancer
4. Test escrow deposit/release functionality
5. Submit reviews and check reputation updates
6. Participate in governance proposals
7. View transaction history on [Hedera Testnet Explorer](https://hashscan.io/testnet)

---

## 🌟 Key Features

### Phase 1: MVP Launch (Q3 2025) ✅ In Progress

#### Core Functionality
- **User Authentication & Profiles**
  - Wallet and Email authentication with Hedera DID
  - Multi-role support: Client, Freelancer, Admin
  - Comprehensive profile system with skills, portfolio, and work history
  - KYC verification integration (optional for premium features)

#### Job Marketplace
- **Job Posting & Matching**
  - Create, browse, and filter jobs by skills, budget, timeline
  - AI-powered job-freelancer matching algorithm
  - Smart contract-based job agreements with milestone tracking
  - Real-time notifications for job updates

#### Payment System
- **Escrow & Payments**
  - Multi-currency support: $HBAR, $USDC (HTS)
  - Automated escrow with milestone-based releases
  - Instant cross-border payments (3-5 second finality)
  - Transaction history and invoicing

#### Trust & Security
- **Reputation System**
  - Immutable ratings and reviews logged to HCS
  - Transparent reputation scoring algorithm
  - Badge system for verified skills and achievements
  - Dispute resolution framework with community arbitration

### Phase 2: AI + DAO Beta (Q4 2025)
- **AI-Powered Features**
  - Job matching and recommendation engine
  - Automated task breakdown and estimation
  - Smart milestone suggestion
  - Fraud detection and risk assessment

- **DAO Governance**
  - $FDAO token for governance voting
  - Proposal creation and voting system
  - Community-driven platform upgrades
  - Treasury management by token holders

- **Staking & Rewards**
  - Stake $FDAO for platform benefits
  - Earn rewards for good reputation and participation
  - Reduced platform fees for stakers
  - Loyalty incentives for long-term users

### Phase 3: Hybrid Workflows & Pods (Q1 2026)
- **Team Collaboration**
  - Create talent pods for complex projects
  - Team-based project management tools
  - AI-human hybrid workflows
  - Revenue sharing within pods

- **Advanced Contracts**
  - Multi-milestone complex contracts
  - Recurring service agreements
  - Cross-pod collaboration tools
  - Automated invoicing and accounting

### Phase 4: Global Scale & Full Decentralization (Q2 2026)
- **Global Expansion**
  - Regional talent pods (Africa, Asia, LatAm, Europe)
  - Multi-language support (10+ languages)
  - Local payment method integrations
  - Regional compliance and regulations

- **Full Decentralization**
  - Advanced AI agents marketplace (v2)
  - Lifetime royalties for AI agent creators
  - Mobile applications (iOS & Android)
  - Complete decentralized identity integration
  - Cross-chain bridging (future exploration)

---

## 👥 Team Certification

### Hedera Certified Developer

**Co-founder of FreeLanceDAO: MIKAILU Samuel Nadro**

<img width="1437" alt="Hedera Hashgraph Developer Certification" src="https://github.com/user-attachments/assets/13820f89-fdc9-4aee-899d-6620450ad76b" />

**Certification Details:**
- **Certification:** Hedera Certified Developer
- **Issued By:** Hedera Hashgraph
- **Role:** Co-founder & Lead Blockchain Developer
- **Expertise:** Smart Contract Development, HCS/HTS/HSCS Integration, DApp Architecture

---

## 📊 Project Status & Traction

### Current Status (TRL 4-6: Prototype/Working Core Feature)

**Technology Readiness Level:** TRL 5 - Component Validation in Relevant Environment

**What's Built:**
- ✅ Four deployed and tested smart contracts on Hedera Testnet
- ✅ Working escrow system with deposit/release functionality
- ✅ Staking mechanism with reward distribution
- ✅ Governance proposal creation and voting
- ✅ Basic dispute resolution workflow
- ✅ Frontend UI with wallet integration (HashPack)
- ✅ Backend API with database integration
- 🚧 HCS logging integration (in progress)
- 🚧 HTS token creation (pending)
- 🚧 Full end-to-end user journey (90% complete)

**Verified Testnet Transactions:**
- Contract Deployments: [View on HashScan](https://hashscan.io/testnet/contract/0.0.7158715)
- Example Escrow Transaction: [View on HashScan](https://hashscan.io/testnet/transaction/0.0.XXXXX)
- Example Staking Transaction: [View on HashScan](https://hashscan.io/testnet/transaction/0.0.XXXXX)

### Traction Targets

**6-Month Milestones (Q3-Q4 2025):**
- 100+ AI agents onboarded to marketplace
- Pilot partnerships with 5 Web3 projects
- 10,000+ freelancers registered
- $50,000+ Total Value Locked (TVL) in escrow
- Community of 5,000+ early adopters

**12-Month Goals (By Q2 2026):**
- $2M GMV (Gross Marketplace Volume)
- 50,000+ active users
- Expansion to 3 African countries
- Enterprise adoption (5+ corporate clients)
- DAO launch with $FDAO token liquidity

---

## 💰 Business Model & Economics

### Revenue Streams

1. **Transaction Fees:** 5% from every job (human or AI agent)
2. **Agent Listing Fees:** Fee to upload/train AI agents on platform
3. **AI Agent Royalties:** 15% fee on agent usage/transfer
4. **Token Utility:** $FDAO for governance, staking, premium access, and rewards
5. **Enterprise Subscriptions:** White-label solutions for companies

### Economic Justification - Why Hedera Enables Our Business Model

Our 5% platform fee is only possible because Hedera's predictable micro-fees allow us to process transactions profitably even for small jobs. On Ethereum, a $20 job with $5 gas fees would be economically unviable—we'd lose money on each transaction. Hedera's $0.0367 per contract call means we can serve the entire spectrum of freelance work, from $10 gigs to $10,000 contracts, while maintaining healthy margins.

**Comparison:**
- **FreeLanceDAO (Hedera):** 5% fee + $0.04 blockchain cost = **5.2% total**
- **Upwork:** 20% fee + $0.30 payment processing = **20.3% total**
- **Traditional Finance:** 3% processing + $25 wire fee = **8% total on $500 job**

This 4x cost advantage versus traditional platforms creates a powerful flywheel: lower fees → more users → more liquidity → more transactions → economies of scale → even better pricing.

---

## Pitch Deck

Get our pitch deck in the link below

https://drive.google.com/file/d/1X5hg4FDRpr8c6epjI0s-lMES_KOB6cEX/view?usp=drivesdk

---
## 🤝 Contributing

We welcome contributions from the Hedera and Web3 communities! Your expertise can help shape the future of decentralized freelancing.

### How to Contribute

1. **Fork the Project**
   ```bash
   git fork https://github.com/mikky69/Freelance-DAO.git
   ```

2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Describe your changes in detail

### Code Quality Standards

We maintain high code quality standards to ensure easy auditing:

- **Linting:** ESLint + Prettier configured (run `npm run lint`)
- **Naming Conventions:** Clear, descriptive function and variable names
- **Comments:** Complex logic must include inline comments
- **Testing:** Write tests for new features (Jest + React Testing Library)
- **Commits:** Follow conventional commits format
- **Documentation:** Update README for significant changes

### Areas Where We Need Help

- Smart contract security audits
- Frontend UI/UX improvements
- Additional Hedera service integrations
- Documentation and tutorials
- Translation and localization
- Community management

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌍 Community & Links

### Connect With Us

- **Website:** [https://www.freelancedao.xyz](https://www.freelancedao.xyz) ✅ LIVE
- **Twitter:** [@Freelance_DAO](https://www.x.com/Freelance_DAO)
- **Discord:** [Join our community](https://discord.gg/freelancedao) (invite link coming soon)
- **GitHub:** [Freelance-DAO Repository](https://github.com/mikky69/Freelance-DAO)
- **DoraHacks:** [View Our Submission](https://dorahacks.io/buidl/xxxxx)

### Important Links

- **Hedera Portal:** [portal.hedera.com](https://portal.hedera.com/)
- **Hedera Documentation:** [docs.hedera.com](https://docs.hedera.com/)
- **HashScan Explorer (Testnet):** [hashscan.io/testnet](https://hashscan.io/testnet)
- **Hedera Faucet:** [portal.hedera.com/faucet](https://portal.hedera.com/faucet)

---

## 🙏 Acknowledgments

- **Hedera Hashgraph** for their groundbreaking DLT technology and developer support
- **Hedera Association** for hosting this hackathon and fostering innovation
- **Open-source community** for invaluable tools and libraries
- **Early contributors** and supporters of FreeLanceDAO
- **HashPack & Blade** wallet teams for seamless Web3 integration

---

## 📞 Support & Contact

For technical questions, partnership inquiries, or general support:

- **Email:** support@freelancedao.io (coming soon)
- **GitHub Issues:** [Report bugs or request features](https://github.com/mikky69/Freelance-DAO/issues)
- **Twitter DM:** [@Freelance_DAO](https://www.x.com/Freelance_DAO)

---

<div align="center">
  <p><strong>Built with ❤️ on Hedera Hashgraph</strong></p>
  <p><em>Empowering the future of work through decentralization</em></p>
  
  ![Hedera Logo](https://hedera.com/logo.svg)
</div>

---

## 🔒 Security & Secrets - CRITICAL NOTICE

**⚠️ DO NOT COMMIT PRIVATE KEYS OR SENSITIVE CREDENTIALS**

This repository follows strict security practices:

- All private keys are stored in `.env.local` (git-ignored)
- `.env.example` contains only placeholder values
- Sensitive files are listed in `.gitignore`
- Judges receive test credentials via secure DoraHacks submission field

**For Judges:**
Test credentials (Account ID and Private

