import anchor from "@coral-xyz/anchor";
const { Program, BN, AnchorProvider } = anchor;
import { expect } from "chai";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  createAccount,
  mintTo,
} from "@solana/spl-token";
import * as fs from "fs";

describe("governance", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Governance as Program<any>;
  const provider = anchor.getProvider();

  let admin: Keypair;
  let user1: Keypair;
  let user2: Keypair;
  let daoConfig: PublicKey;
  let daoConfigKeypair: Keypair;
  let treasury: PublicKey;
  let usdcMint: PublicKey;
  let usdcTreasury: PublicKey;
  let adminUsdcAccount: PublicKey;
  let user1UsdcAccount: PublicKey;
  let user2UsdcAccount: PublicKey;

  const LIGHT_FEE_USDC = 1_000_000; // 1 USDC (6 decimals)
  const MAJOR_FEE_USDC = 5_000_000; // 5 USDC
  const VOTE_FEE_LAMPORTS = 0.001 * LAMPORTS_PER_SOL; // 0.001 SOL
  const MIN_VOTE_DURATION = 60; // 1 minute
  const MAX_VOTE_DURATION = 7 * 24 * 60 * 60; // 1 week
  const ELIGIBILITY_FLAGS = 1; // Basic eligibility

  function loadKeypairFromFile(path: string): Keypair {
    try {
      const secretKeyString = fs.readFileSync(path, 'utf8');
      const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
      return Keypair.fromSecretKey(secretKey);
    } catch (error) {
      console.error(`Failed to load keypair from ${path}:`, error);
      return Keypair.generate();
    }
  }

  before(async () => {
    admin = loadKeypairFromFile('./test-keys/admin.json');
    user1 = loadKeypairFromFile('./test-keys/user1.json');
    user2 = loadKeypairFromFile('./test-keys/user2.json');

    console.log("Loaded keypairs:");
    console.log("Admin:", admin.publicKey.toString());
    console.log("User1:", user1.publicKey.toString());
    console.log("User2:", user2.publicKey.toString());

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(admin.publicKey, 10 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user1.publicKey, 10 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user2.publicKey, 10 * LAMPORTS_PER_SOL)
    );

    usdcMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      6
    );

    [treasury] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      program.programId
    );

    const usdcTreasuryKeypair = Keypair.generate();
    usdcTreasury = await createAccount(
      provider.connection,
      admin,
      usdcMint,
      admin.publicKey,
      usdcTreasuryKeypair
    );

    adminUsdcAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      usdcMint,
      admin.publicKey
    );

    user1UsdcAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      usdcMint,
      user1.publicKey
    );

    user2UsdcAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      usdcMint,
      user2.publicKey
    );

    await mintTo(
      provider.connection,
      admin,
      usdcMint,
      adminUsdcAccount,
      admin,
      100_000_000
    );

    await mintTo(
      provider.connection,
      admin,
      usdcMint,
      user1UsdcAccount,
      admin,
      50_000_000
    );

    await mintTo(
      provider.connection,
      admin,
      usdcMint,
      user2UsdcAccount,
      admin,
      50_000_000
    );

    daoConfigKeypair = Keypair.generate();
    daoConfig = daoConfigKeypair.publicKey;

    await program.methods
      .initDaoConfig(
        new BN(LIGHT_FEE_USDC),
        new BN(MAJOR_FEE_USDC),
        new BN(VOTE_FEE_LAMPORTS),
        new BN(MIN_VOTE_DURATION),
        new BN(MAX_VOTE_DURATION),
        ELIGIBILITY_FLAGS
      )
      .accounts({
        daoConfig: daoConfig,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([admin, daoConfigKeypair])
      .rpc();

    console.log("Setup completed:");
    console.log("Admin:", admin.publicKey.toString());
    console.log("DAO Config:", daoConfig.toString());
    console.log("Treasury PDA:", treasury.toString());
    console.log("USDC Mint:", usdcMint.toString());
    console.log("USDC Treasury:", usdcTreasury.toString());
  });

  describe("Initialization", () => {
    it("Verifies DAO config was initialized correctly", async () => {
      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      expect(daoConfigAccount.admin.toString()).to.equal(admin.publicKey.toString());
      expect(daoConfigAccount.lightFeeUsdc.toNumber()).to.equal(LIGHT_FEE_USDC);
      expect(daoConfigAccount.majorFeeUsdc.toNumber()).to.equal(MAJOR_FEE_USDC);
      expect(daoConfigAccount.voteFeeLamports.toNumber()).to.equal(VOTE_FEE_LAMPORTS);
      expect(daoConfigAccount.minVoteDuration.toNumber()).to.equal(MIN_VOTE_DURATION);
      expect(daoConfigAccount.maxVoteDuration.toNumber()).to.equal(MAX_VOTE_DURATION);
      expect(daoConfigAccount.eligibilityFlags).to.equal(ELIGIBILITY_FLAGS);
      expect(daoConfigAccount.paused).to.equal(false);
      expect(daoConfigAccount.proposalCount.toNumber()).to.equal(0);
    });

    it("Fails to initialize with invalid vote duration", async () => {
      const invalidDaoConfigKeypair = Keypair.generate();
      const invalidDaoConfig = invalidDaoConfigKeypair.publicKey;

      try {
        await program.methods
          .initDaoConfig(
            new BN(LIGHT_FEE_USDC),
            new BN(MAJOR_FEE_USDC),
            new BN(VOTE_FEE_LAMPORTS),
            new BN(MAX_VOTE_DURATION),
            new BN(MIN_VOTE_DURATION),
            ELIGIBILITY_FLAGS
          )
          .accounts({
            daoConfig: invalidDaoConfig,
            admin: admin.publicKey,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([admin, invalidDaoConfigKeypair])
          .rpc();

        expect.fail("Should have failed with invalid window");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("InvalidWindow");
      }
    });
  });

  describe("Admin Functions", () => {
    it("Updates DAO parameters as admin", async () => {
      const newLightFee = 2_000_000;
      const newMajorFee = 10_000_000;

      await program.methods
        .setParams(
          new BN(newLightFee),
          new BN(newMajorFee),
          null,
          null,
          null,
          null,
          null
        )
        .accounts({
          daoConfig: daoConfig,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      expect(daoConfigAccount.lightFeeUsdc.toNumber()).to.equal(newLightFee);
      expect(daoConfigAccount.majorFeeUsdc.toNumber()).to.equal(newMajorFee);
    });

    it("Fails to update parameters as non-admin", async () => {
      try {
        await program.methods
          .setParams(
            new BN(1_000_000),
            null,
            null,
            null,
            null,
            null,
            null
          )
          .accounts({
            daoConfig: daoConfig,
            admin: user1.publicKey,
          })
          .signers([user1])
          .rpc();

        expect.fail("Should have failed with unauthorized");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("Unauthorized");
      }
    });

    it("Pauses and unpauses the DAO", async () => {
      await program.methods
        .setPause(true)
        .accounts({
          daoConfig: daoConfig,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      let daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      expect(daoConfigAccount.paused).to.equal(true);

      await program.methods
        .setPause(false)
        .accounts({
          daoConfig: daoConfig,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      expect(daoConfigAccount.paused).to.equal(false);
    });
  });

  describe("Proposal Creation", () => {
    let proposalId: BN;
    let proposal: PublicKey;

    beforeEach(async () => {
      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      proposalId = daoConfigAccount.proposalCount;
      [proposal] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          daoConfig.toBuffer(),
          proposalId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );
    });

    it("Creates a light proposal successfully", async () => {
      const uri = "https://example.com/proposal/1";
      const titleHash = Array.from(anchor.utils.sha256.hash("Test Light Proposal"));
      const window = 3600;

      const tx = await program.methods
        .createProposal(
          { light: {} },
          uri,
          titleHash,
          new BN(window)
        )
        .accounts({
          daoConfig: daoConfig,
          proposal: proposal,
          creator: user1.publicKey,
          usdcTreasury: usdcTreasury,
          creatorUsdc: user1UsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .signers([user1])
        .rpc();

      console.log("Light proposal created with signature:", tx);

      const proposalAccount = await program.account.proposal.fetch(proposal);
      expect(proposalAccount.creator.toString()).to.equal(user1.publicKey.toString());
      expect(proposalAccount.kind).to.deep.equal({ light: {} });
      expect(proposalAccount.uri).to.equal(uri);
      expect(proposalAccount.state).to.deep.equal({ active: {} });
      expect(proposalAccount.tallyYes.toNumber()).to.equal(0);
      expect(proposalAccount.tallyNo.toNumber()).to.equal(0);

      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      expect(daoConfigAccount.proposalCount.toNumber()).to.equal(1);
    });

    it("Creates a major proposal successfully", async () => {
      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      const nextProposalId = daoConfigAccount.proposalCount;
      const [nextProposal] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          daoConfig.toBuffer(),
          nextProposalId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const uri = "https://example.com/proposal/major";
      const titleHash = Array.from(anchor.utils.sha256.hash("Test Major Proposal"));
      const window = 7 * 24 * 3600;

      const tx = await program.methods
        .createProposal(
          { major: {} },
          uri,
          titleHash,
          new BN(window)
        )
        .accounts({
          daoConfig: daoConfig,
          proposal: nextProposal,
          creator: user2.publicKey,
          usdcTreasury: usdcTreasury,
          creatorUsdc: user2UsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .signers([user2])
        .rpc();

      console.log("Major proposal created with signature:", tx);

      const proposalAccount = await program.account.proposal.fetch(nextProposal);
      expect(proposalAccount.kind).to.deep.equal({ major: {} });
    });

    it("Fails to create proposal when paused", async () => {
      await program.methods
        .setPause(true)
        .accounts({
          daoConfig: daoConfig,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      const nextProposalId = daoConfigAccount.proposalCount;
      const [nextProposal] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          daoConfig.toBuffer(),
          nextProposalId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const uri = "https://example.com/proposal/paused";
      const titleHash = Array.from(anchor.utils.sha256.hash("Paused Test"));
      const window = 3600;

      try {
        await program.methods
          .createProposal(
            { light: {} },
            uri,
            titleHash,
            new BN(window)
          )
          .accounts({
            daoConfig: daoConfig,
            proposal: nextProposal,
            creator: user1.publicKey,
            usdcTreasury: usdcTreasury,
            creatorUsdc: user1UsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
        .signers([user1])
        .rpc();

        expect.fail("Should have failed when paused");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("Paused");
      }

      await program.methods
        .setPause(false)
        .accounts({
          daoConfig: daoConfig,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();
    });

    it("Fails with invalid voting window", async () => {
      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      const nextProposalId = daoConfigAccount.proposalCount;
      const [nextProposal] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          daoConfig.toBuffer(),
          nextProposalId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const uri = "https://example.com/proposal/invalid";
      const titleHash = Array.from(anchor.utils.sha256.hash("Invalid Window"));
      const invalidWindow = 30;

      try {
        await program.methods
          .createProposal(
            { light: {} },
            uri,
            titleHash,
            new BN(invalidWindow)
          )
          .accounts({
            daoConfig: daoConfig,
            proposal: nextProposal,
            creator: user1.publicKey,
            usdcTreasury: usdcTreasury,
            creatorUsdc: user1UsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
        .signers([user1])
        .rpc();

        expect.fail("Should have failed with invalid window");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("InvalidWindow");
      }
    });

    it("Fails with URI too long", async () => {
      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      const nextProposalId = daoConfigAccount.proposalCount;
      const [nextProposal] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          daoConfig.toBuffer(),
          nextProposalId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const longUri = "a".repeat(201);
      const titleHash = Array.from(anchor.utils.sha256.hash("Long URI"));
      const window = 3600;

      try {
        await program.methods
          .createProposal(
            { light: {} },
            longUri,
            titleHash,
            new BN(window)
          )
          .accounts({
            daoConfig: daoConfig,
            proposal: nextProposal,
            creator: user1.publicKey,
            usdcTreasury: usdcTreasury,
            creatorUsdc: user1UsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
        .signers([user1])
        .rpc();

        expect.fail("Should have failed with URI too long");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("UriTooLong");
      }
    });
  });

  describe("Voting", () => {
    let activeProposal: PublicKey;

    before(async () => {
      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      const proposalId = daoConfigAccount.proposalCount;
      [activeProposal] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          daoConfig.toBuffer(),
          proposalId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const uri = "https://example.com/proposal/voting";
      const titleHash = Array.from(anchor.utils.sha256.hash("Voting Test Proposal"));
      const window = 3600;

      await program.methods
        .createProposal(
          { light: {} },
          uri,
          titleHash,
          new BN(window)
        )
        .accounts({
          daoConfig: daoConfig,
          proposal: activeProposal,
          creator: admin.publicKey,
          usdcTreasury: usdcTreasury,
          creatorUsdc: adminUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .signers([admin])
        .rpc();
    });

    it("Casts a vote successfully", async () => {
      const [voteRecord] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vote"),
          activeProposal.toBuffer(),
          user1.publicKey.toBuffer(),
        ],
        program.programId
      );

      const tx = await program.methods
        .castVote({ yes: {} })
        .accounts({
          daoConfig: daoConfig,
          proposal: activeProposal,
          voteRecord: voteRecord,
          voter: user1.publicKey,
          treasury: treasury,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .signers([user1])
        .rpc();

      console.log("Vote cast with signature:", tx);

      const voteRecordAccount = await program.account.voteRecord.fetch(voteRecord);
      expect(voteRecordAccount.voter.toString()).to.equal(user1.publicKey.toString());
      expect(voteRecordAccount.choice).to.deep.equal({ yes: {} });
      expect(voteRecordAccount.weight.toNumber()).to.equal(1);
      expect(voteRecordAccount.paidFee).to.equal(true);

      const proposalAccount = await program.account.proposal.fetch(activeProposal);
      expect(proposalAccount.tallyYes.toNumber()).to.equal(1);
      expect(proposalAccount.tallyNo.toNumber()).to.equal(0);
    });

    it("Prevents double voting", async () => {
      const [voteRecord] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vote"),
          activeProposal.toBuffer(),
          user1.publicKey.toBuffer(),
        ],
        program.programId
      );

      try {
        await program.methods
          .castVote({ no: {} })
          .accounts({
            daoConfig: daoConfig,
            proposal: activeProposal,
            voteRecord: voteRecord,
            voter: user1.publicKey,
            treasury: treasury,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
        .signers([user1])
        .rpc();

        expect.fail("Should have failed with already voted");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("AlreadyVoted");
      }
    });

    it("Allows another user to vote", async () => {
      const [voteRecord] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vote"),
          activeProposal.toBuffer(),
          user2.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .castVote({ no: {} })
        .accounts({
          daoConfig: daoConfig,
          proposal: activeProposal,
          voteRecord: voteRecord,
          voter: user2.publicKey,
          treasury: treasury,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .signers([user2])
        .rpc();

      const proposalAccount = await program.account.proposal.fetch(activeProposal);
      expect(proposalAccount.tallyYes.toNumber()).to.equal(1);
      expect(proposalAccount.tallyNo.toNumber()).to.equal(1);
    });
  });

  describe("Proposal Finalization", () => {
    let finalizableProposal: PublicKey;

    before(async () => {
      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfig);
      const proposalId = daoConfigAccount.proposalCount;
      [finalizableProposal] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          daoConfig.toBuffer(),
          proposalId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const uri = "https://example.com/proposal/finalize";
      const titleHash = Array.from(anchor.utils.sha256.hash("Finalization Test"));
      const window = 60;

      await program.methods
        .createProposal(
          { light: {} },
          uri,
          titleHash,
          new BN(window)
        )
        .accounts({
          daoConfig: daoConfig,
          proposal: finalizableProposal,
          creator: admin.publicKey,
          usdcTreasury: usdcTreasury,
          creatorUsdc: adminUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .signers([admin])
        .rpc();

      await new Promise(resolve => setTimeout(resolve, 65000));
    });

    it("Finalizes a proposal after voting period ends", async () => {
      const tx = await program.methods
        .finalizeProposal()
        .accounts({
          proposal: finalizableProposal,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .rpc();

      console.log("Proposal finalized with signature:", tx);

      const proposalAccount = await program.account.proposal.fetch(finalizableProposal);
      expect(proposalAccount.state).to.deep.equal({ failed: {} });
    });

    it("Fails to finalize an already finalized proposal", async () => {
      try {
        await program.methods
          .finalizeProposal()
          .accounts({
            proposal: finalizableProposal,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
          .rpc();

        expect.fail("Should have failed with proposal not active");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("ProposalNotActive");
      }
    });
  });
});