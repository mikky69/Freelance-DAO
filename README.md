@@ -1,42 +1,79 @@
# FreeLanceDAO

> A decentralized freelance platform combining Web2 familiarity with Web3 automation and governance on Hedera Hashgraph.
<div align="center">
  <img src="freelance-dao.jpg" alt="FreeLanceDAO Logo" width="120" height="120" style="border-radius: 10px;">
  <h1>FreeLanceDAO</h1>
  <p><em>Decentralized Freelance Platform on Hedera</em></p>
  <h2>🚀 The Future of Freelancing is Decentralized</h2>
  <p>Built on Hedera for enterprise-grade security, speed, and sustainability</p>
</div>

---
## 🌟 Overview

A decentralized freelance platform built on Hedera Hashgraph, combining Web2 familiarity with Hedera's fast, secure, and fair Web3 infrastructure.
FreeLanceDAO revolutionizes the freelance economy by leveraging Hedera's distributed ledger technology to create a transparent, fair, and efficient platform connecting clients with top-tier talent worldwide. Our platform combines the best of Web2 user experience with the power of Web3 automation and governance.

## 🚀 Features
## 🚀 Key Features

### Phase 1: MVP Launch (Q3 2025)
- **User Authentication**: Wallet/Email & Social Login
- **Job Marketplace**: Post, browse, and apply for freelance jobs
- **Escrow Payment System**: Secure payments via Hadera blockchain
- **Payment Methods**: $HBAR, $USDC (Hedera Token Service)
- **Real-time Messaging**: Built-in communication system
- **Reputation System**: Ratings and reviews for all users
- **Admin Dashboard**: Platform management and moderation
- **Token**: $FDAO (HTS Token on Hedera)

### Future Phases
- AI Agent Integration
- DAO Governance
- Hybrid Workflows
- Team Pods
- Cross-Chain Payments
- Mobile App

## 🛠 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express
- **Blockchain**: Hedera Hashgraph, Smart Contracts (Hedera Smart Contract Service)
- **Database**: PostgreSQL with Hedera Consensus Service for audit trails
- **Storage**: IPFS with Hedera File Service for metadata anchoring
- **Authentication**: Hedera DID, NextAuth.js with Hedera Wallet Integration
- **Tokens**: Hedera Token Service (HTS) for $FDAO and stablecoin payments

#### Core Functionality
- **User Authentication & Profiles**
  - Wallet/Email authentication with Hedera DID
  - User roles: Client, Freelancer, Admin
  - Comprehensive profile system with skills and portfolio

#### Job Marketplace
- **Job Posting & Matching**
  - Create, browse, and apply for jobs
  - Smart contract-based job agreements
  - Escrow payment system with $HBAR and $USDC (HTS)

#### Trust & Security
- **Reputation System**
  - Ratings and reviews per completed job
  - Transparent reputation scoring
  - Dispute resolution framework

### Phase 2: AI + DAO Beta
- AI-powered job matching and task automation
- DAO governance with $FDAO token
- Staking and rewards system
- Enhanced dispute resolution with community arbitration

### Phase 3: Hybrid Workflows & Pods
- Team-based project collaboration
- AI-human hybrid workflows
- Milestone-based smart contracts
- Cross-pod collaboration tools

### Phase 4: Global Scale & Full Decentralization
- Global talent pods by region/skill
- Advanced AI agents v2
- Mobile applications
- Decentralized identity integration

## 🛠 Technology Stack

### Core Infrastructure
- **Blockchain**: Hedera Hashgraph (HCS, HTS, HSCS)
- **Smart Contracts**: Hedera Smart Contract Service
- **Tokens**: $FDAO (HTS) for governance and rewards

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI**: React 18, Tailwind CSS, Shadcn/ui
- **State Management**: React Query, Zustand
- **Wallet Integration**: HashPack, Blade Wallet

### Backend
- **Runtime**: Node.js 20+, TypeScript
- **API**: tRPC, Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Hedera DID

### Storage & Off-chain
- **Decentralized Storage**: IPFS + Hedera File Service
- **Indexing**: The Graph (Hedera Mirror Node)
- **Real-time**: WebSockets, Server-Sent Events

## 🚀 Getting Started

@@ -47,12 +84,12 @@ A decentralized freelance platform built on Hedera Hashgraph, combining Web2 fam
- Hedera Testnet Account
- HashPack or Blade Wallet (for Hedera wallet integration)

### Installation
### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/FreeLanceDAO.git
   cd FreeLanceDAO
   git clone https://github.com/mikky69/Freelance-DAO.git
   cd Freelance-DAO
   ```

2. Install dependencies:
@@ -74,21 +111,21 @@ A decentralized freelance platform built on Hedera Hashgraph, combining Web2 fam
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
## 🌐 Why Hedera?

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
### Enterprise-Grade Performance
- **Fast**: 10,000+ TPS with 3-5 second finality
- **Fair**: Asynchronous Byzantine Fault Tolerant (aBFT) security
- **Green**: Carbon-negative network operations
- **Cost-Effective**: Predictable micro-fees in USD

## 🔗 Hedera Integration

FreeLanceDAO leverages Hedera's enterprise-grade blockchain for:
- Fast, fair, and secure transactions with finality in seconds
- Low, predictable fees for microtransactions
- Native tokenization with Hedera Token Service (HTS)
- Decentralized identity with Hedera DID
- Carbon-negative network operations
### Key Hedera Services Used
- **HCS**: Immutable audit trails for all platform actions
- **HTS**: Native $FDAO token and stablecoin payments
- **HSCS**: Smart contracts for escrow and governance
- **HFS**: Decentralized file storage for credentials and work samples

## 🤝 Contributing

@@ -100,14 +137,18 @@ We welcome contributions from the Hedera and Web3 communities! Your expertise ca
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🌐 Community
## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌍 Community

- [Discord](#) - Join our community
- [Twitter](#) - Follow us for updates
- [Website](#) - Coming soon

## 🙏 Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- References
- Hedera Hashgraph for their groundbreaking DLT technology
- The open-source community for invaluable tools and libraries
- Early contributors and supporters of FreeLanceDAO
