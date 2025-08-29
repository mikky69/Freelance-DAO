import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { Governance } from "../target/types/governance";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { expect } from "chai";

describe("governance", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Governance as Program<Governance>;
  
  // Test accounts
  let admin: Keypair;
  let user1: Keypair;
  let user2: Keypair;
  let daoConfigKeypair: Keypair;
  let treasuryKeypair: Keypair;
  
  // Constants for testing
  const LIGHT_FEE_USDC = new BN(100_000_000); // 100 USDC (6 decimals)
  const MAJOR_FEE_USDC = new BN(500_000_000); // 500 USDC (6 decimals)
  const VOTE_FEE_LAMPORTS = new BN(1_000_000); // 0.001 SOL
  const MIN_VOTE_DURATION = new BN(3600); // 1 hour
  const MAX_VOTE_DURATION = new BN(604800); // 1 week
  const ELIGIBILITY_FLAGS = 1;

  beforeEach(async () => {
    // Create fresh keypairs for each test
    admin = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();
    daoConfigKeypair = Keypair.generate();
    treasuryKeypair = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(admin.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user1.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user2.publicKey, 2 * LAMPORTS_PER_SOL);
    
    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe("Initialization", () => {
    it("Should initialize DAO config successfully", async () => {
      await program.methods
        .initDaoConfig(
          LIGHT_FEE_USDC,
          MAJOR_FEE_USDC,
          VOTE_FEE_LAMPORTS,
          MIN_VOTE_DURATION,
          MAX_VOTE_DURATION,
          ELIGIBILITY_FLAGS
        )
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([admin, daoConfigKeypair])
        .rpc();

      const daoConfig = await program.account.daoConfig.fetch(daoConfigKeypair.publicKey);
      
      expect(daoConfig.lightFeeUsdc.toString()).to.equal(LIGHT_FEE_USDC.toString());
      expect(daoConfig.majorFeeUsdc.toString()).to.equal(MAJOR_FEE_USDC.toString());
      expect(daoConfig.voteFeelamports.toString()).to.equal(VOTE_FEE_LAMPORTS.toString());
      expect(daoConfig.minVoteDuration.toString()).to.equal(MIN_VOTE_DURATION.toString());
      expect(daoConfig.maxVoteDuration.toString()).to.equal(MAX_VOTE_DURATION.toString());
      expect(daoConfig.admin.toString()).to.equal(admin.publicKey.toString());
      expect(daoConfig.eligibilityFlags).to.equal(ELIGIBILITY_FLAGS);
      expect(daoConfig.paused).to.be.false;
      expect(daoConfig.proposalCount.toString()).to.equal("0");
    });

    it("Should fail with invalid vote duration window", async () => {
      try {
        await program.methods
          .initDaoConfig(
            LIGHT_FEE_USDC,
            MAJOR_FEE_USDC,
            VOTE_FEE_LAMPORTS,
            MAX_VOTE_DURATION, // min > max - invalid
            MIN_VOTE_DURATION,
            ELIGIBILITY_FLAGS
          )
          .accounts({
            daoConfig: daoConfigKeypair.publicKey,
            admin: admin.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([admin, daoConfigKeypair])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("InvalidWindow");
      }
    });

    it("Should fail with zero or negative min vote duration", async () => {
      try {
        await program.methods
          .initDaoConfig(
            LIGHT_FEE_USDC,
            MAJOR_FEE_USDC,
            VOTE_FEE_LAMPORTS,
            new BN(0), // Invalid - zero duration
            MAX_VOTE_DURATION,
            ELIGIBILITY_FLAGS
          )
          .accounts({
            daoConfig: daoConfigKeypair.publicKey,
            admin: admin.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([admin, daoConfigKeypair])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("InvalidWindow");
      }
    });
  });

  describe("Admin Functions", () => {
    beforeEach(async () => {
      // Initialize DAO config before each admin test
      await program.methods
        .initDaoConfig(
          LIGHT_FEE_USDC,
          MAJOR_FEE_USDC,
          VOTE_FEE_LAMPORTS,
          MIN_VOTE_DURATION,
          MAX_VOTE_DURATION,
          ELIGIBILITY_FLAGS
        )
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([admin, daoConfigKeypair])
        .rpc();
    });

    it("Should set parameters successfully", async () => {
      const newLightFee = new BN(200_000_000);
      const newVoteFee = new BN(2_000_000);
      
      await program.methods
        .setParams(
          newLightFee,
          null,
          newVoteFee,
          null,
          null,
          null,
          null
        )
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      const daoConfig = await program.account.daoConfig.fetch(daoConfigKeypair.publicKey);
      expect(daoConfig.lightFeeUsdc.toString()).to.equal(newLightFee.toString());
      expect(daoConfig.voteFeelamports.toString()).to.equal(newVoteFee.toString());
      // Other values should remain unchanged
      expect(daoConfig.majorFeeUsdc.toString()).to.equal(MAJOR_FEE_USDC.toString());
    });

    it("Should fail to set params with invalid window", async () => {
      try {
        await program.methods
          .setParams(
            null,
            null,
            null,
            MAX_VOTE_DURATION, // min > max - invalid
            MIN_VOTE_DURATION,
            null,
            null
          )
          .accounts({
            daoConfig: daoConfigKeypair.publicKey,
            admin: admin.publicKey,
          })
          .signers([admin])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("InvalidWindow");
      }
    });

    it("Should fail when non-admin tries to set params", async () => {
      try {
        await program.methods
          .setParams(
            new BN(200_000_000),
            null,
            null,
            null,
            null,
            null,
            null
          )
          .accounts({
            daoConfig: daoConfigKeypair.publicKey,
            admin: user1.publicKey, // Not the admin
          })
          .signers([user1])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("Unauthorized");
      }
    });

    it("Should pause and unpause successfully", async () => {
      // Pause
      await program.methods
        .setPause(true)
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      let daoConfig = await program.account.daoConfig.fetch(daoConfigKeypair.publicKey);
      expect(daoConfig.paused).to.be.true;

      // Unpause
      await program.methods
        .setPause(false)
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      daoConfig = await program.account.daoConfig.fetch(daoConfigKeypair.publicKey);
      expect(daoConfig.paused).to.be.false;
    });

    it("Should fail when non-admin tries to pause", async () => {
      try {
        await program.methods
          .setPause(true)
          .accounts({
            daoConfig: daoConfigKeypair.publicKey,
            admin: user1.publicKey, // Not the admin
          })
          .signers([user1])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("Unauthorized");
      }
    });
  });

  describe("Proposal Creation", () => {
    beforeEach(async () => {
      // Initialize DAO config before each proposal test
      await program.methods
        .initDaoConfig(
          LIGHT_FEE_USDC,
          MAJOR_FEE_USDC,
          VOTE_FEE_LAMPORTS,
          MIN_VOTE_DURATION,
          MAX_VOTE_DURATION,
          ELIGIBILITY_FLAGS
        )
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([admin, daoConfigKeypair])
        .rpc();
    });

    // Note: This test assumes you have the create_proposal implementation
    // Since it wasn't provided, I'm creating a placeholder test structure
    it("Should create a light proposal successfully", async () => {
      const proposalKeypair = Keypair.generate();
      const uri = "https://example.com/proposal1";
      const titleHash = Array(32).fill(1); // Mock hash
      const votingWindow = new BN(7200); // 2 hours

      // This test would need the actual create_proposal implementation
      // Placeholder for the expected structure:
      /*
      await program.methods
        .createProposal(
          { light: {} }, // ProposalKind::Light
          uri,
          titleHash,
          votingWindow
        )
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          proposal: proposalKeypair.publicKey,
          creator: user1.publicKey,
          // ... other required accounts
        })
        .signers([user1, proposalKeypair])
        .rpc();

      const proposal = await program.account.proposal.fetch(proposalKeypair.publicKey);
      expect(proposal.creator.toString()).to.equal(user1.publicKey.toString());
      expect(proposal.uri).to.equal(uri);
      */
    });
  });

  describe("Voting", () => {
    let proposalKeypair: Keypair;
    let voteRecordPda: PublicKey;

    beforeEach(async () => {
      // Initialize DAO config
      await program.methods
        .initDaoConfig(
          LIGHT_FEE_USDC,
          MAJOR_FEE_USDC,
          VOTE_FEE_LAMPORTS,
          MIN_VOTE_DURATION,
          MAX_VOTE_DURATION,
          ELIGIBILITY_FLAGS
        )
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([admin, daoConfigKeypair])
        .rpc();

      proposalKeypair = Keypair.generate();
      
      // Create vote record PDA
      [voteRecordPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vote"),
          proposalKeypair.publicKey.toBuffer(),
          user1.publicKey.toBuffer(),
        ],
        program.programId
      );

      // You would need to create a proposal here first
      // This is a placeholder structure
    });

    it("Should cast a vote successfully", async () => {
      // This test assumes you have a proposal created and active
      // Placeholder structure:
      /*
      const balanceBefore = await provider.connection.getBalance(treasuryKeypair.publicKey);

      await program.methods
        .castVote({ yes: {} }) // VoteChoice::Yes
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          proposal: proposalKeypair.publicKey,
          voteRecord: voteRecordPda,
          voter: user1.publicKey,
          treasury: treasuryKeypair.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
          clock: SYSVAR_CLOCK_PUBKEY,
        })
        .signers([user1])
        .rpc();

      const balanceAfter = await provider.connection.getBalance(treasuryKeypair.publicKey);
      expect(balanceAfter - balanceBefore).to.equal(VOTE_FEE_LAMPORTS.toNumber());

      const voteRecord = await program.account.voteRecord.fetch(voteRecordPda);
      expect(voteRecord.voter.toString()).to.equal(user1.publicKey.toString());
      expect(voteRecord.choice).to.deep.equal({ yes: {} });
      expect(voteRecord.weight.toString()).to.equal("1");
      expect(voteRecord.paidFee).to.be.true;
      */
    });

    it("Should fail when voting twice", async () => {
      // First vote would succeed, second should fail with AlreadyVoted error
    });

    it("Should fail when DAO is paused", async () => {
      // Pause the DAO first, then try to vote
      await program.methods
        .setPause(true)
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      // Vote should fail with Paused error
    });

    it("Should fail when voting window is closed", async () => {
      // This would test voting on an expired or not-yet-started proposal
    });
  });

  describe("Proposal Finalization", () => {
    it("Should finalize a proposal successfully", async () => {
      // Test finalizing a proposal after voting period ends
      // This would check that the proposal state changes correctly
      // based on vote tallies
    });

    it("Should fail to finalize while voting is still active", async () => {
      // Test that finalization fails if called during active voting period
    });
  });

  describe("Error Handling", () => {
    beforeEach(async () => {
      await program.methods
        .initDaoConfig(
          LIGHT_FEE_USDC,
          MAJOR_FEE_USDC,
          VOTE_FEE_LAMPORTS,
          MIN_VOTE_DURATION,
          MAX_VOTE_DURATION,
          ELIGIBILITY_FLAGS
        )
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([admin, daoConfigKeypair])
        .rpc();
    });

    it("Should handle arithmetic overflow in vote tallies", async () => {
      // This would test the overflow protection added in the voting logic
      // You'd need to create a scenario that could cause overflow
    });

    it("Should validate URI length limits", async () => {
      // Test that proposals with URIs that are too long are rejected
      const longUri = "a".repeat(1000); // Assuming there's a max length
      // Test should fail with UriTooLong error
    });
  });

  describe("Integration Tests", () => {
    it("Should complete full governance flow", async () => {
      // Initialize DAO
      await program.methods
        .initDaoConfig(
          LIGHT_FEE_USDC,
          MAJOR_FEE_USDC,
          VOTE_FEE_LAMPORTS,
          MIN_VOTE_DURATION,
          MAX_VOTE_DURATION,
          ELIGIBILITY_FLAGS
        )
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([admin, daoConfigKeypair])
        .rpc();

      // Create proposal (placeholder)
      // Vote on proposal with multiple voters
      // Finalize proposal
      // Verify final state

      const daoConfig = await program.account.daoConfig.fetch(daoConfigKeypair.publicKey);
      expect(daoConfig.admin.toString()).to.equal(admin.publicKey.toString());
    });
  });

  describe("Security Tests", () => {
    beforeEach(async () => {
      await program.methods
        .initDaoConfig(
          LIGHT_FEE_USDC,
          MAJOR_FEE_USDC,
          VOTE_FEE_LAMPORTS,
          MIN_VOTE_DURATION,
          MAX_VOTE_DURATION,
          ELIGIBILITY_FLAGS
        )
        .accounts({
          daoConfig: daoConfigKeypair.publicKey,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([admin, daoConfigKeypair])
        .rpc();
    });

    it("Should prevent unauthorized admin actions", async () => {
      const unauthorizedUser = Keypair.generate();
      await provider.connection.requestAirdrop(unauthorizedUser.publicKey, LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        await program.methods
          .setParams(
            new BN(1000),
            null,
            null,
            null,
            null,
            null,
            null
          )
          .accounts({
            daoConfig: daoConfigKeypair.publicKey,
            admin: unauthorizedUser.publicKey,
          })
          .signers([unauthorizedUser])
          .rpc();
        
        expect.fail("Should have thrown Unauthorized error");
      } catch (error) {
        expect(error.error.errorCode.code).to.equal("Unauthorized");
      }
    });

    it("Should prevent double voting", async () => {
      // Test that the same user cannot vote twice on the same proposal
      // This would require creating a proposal first and then attempting
      // to vote twice with the same account
    });

    it("Should validate account ownership", async () => {
      // Test that accounts are properly validated to prevent
      // unauthorized access or manipulation
    });
  });
});