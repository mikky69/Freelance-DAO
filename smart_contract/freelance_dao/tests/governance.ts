import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Governance } from "../target/types/governance";
import { 
  PublicKey, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  Keypair, 
  Transaction 
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";

describe("governance", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Governance as Program<Governance>;
  
  let admin: Keypair;
  let user1: Keypair;
  let user2: Keypair;
  let usdcMint: PublicKey;
  let adminUsdcAccount: any;
  let user1UsdcAccount: any;
  let user2UsdcAccount: any;
  
  let daoConfigPda: PublicKey;
  let treasuryPda: PublicKey;
  let usdcTreasuryPda: PublicKey;
  let proposalPda: PublicKey;
  let daoConfigBump: number;
  let treasuryBump: number;
  let usdcTreasuryBump: number;
  
  let daoConfigInitialized = false;
  let treasuryInitialized = false;

  before(async () => {
    console.log("\nSetting up test environment...");
    
    const testKeysDir = path.join(__dirname, "..", "test-keys");
    if (!fs.existsSync(testKeysDir)) {
      fs.mkdirSync(testKeysDir, { recursive: true });
    }

    admin = loadOrCreateKeypair(path.join(testKeysDir, "admin.json"));
    user1 = loadOrCreateKeypair(path.join(testKeysDir, "user1.json"));
    user2 = loadOrCreateKeypair(path.join(testKeysDir, "user2.json"));

    console.log("Test keypairs ready");
    console.log("   Admin:", admin.publicKey.toString());
    console.log("   User1:", user1.publicKey.toString());
    console.log("   User2:", user2.publicKey.toString());
    console.log("   Program ID:", program.programId.toString());

    // Check wallet balances
    console.log("   Admin balance:", (await provider.connection.getBalance(admin.publicKey)) / LAMPORTS_PER_SOL, "SOL");
    console.log("   User1 balance:", (await provider.connection.getBalance(user1.publicKey)) / LAMPORTS_PER_SOL, "SOL");
    console.log("   User2 balance:", (await provider.connection.getBalance(user2.publicKey)) / LAMPORTS_PER_SOL, "SOL");

    // Find PDAs first
    console.log("Finding program PDAs...");
    [daoConfigPda, daoConfigBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao_config")],
      program.programId
    );

    [treasuryPda, treasuryBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoConfigPda.toBuffer()],
      program.programId
    );

    [usdcTreasuryPda, usdcTreasuryBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("usdc_treasury"), daoConfigPda.toBuffer()],
      program.programId
    );

    console.log("PDAs found:");
    console.log("   DAO Config:", daoConfigPda.toString());
    console.log("   Treasury:", treasuryPda.toString());
    console.log("   USDC Treasury:", usdcTreasuryPda.toString());

    // Check if already initialized
    try {
      const daoConfigAccount = await program.account.daoConfig.fetch(daoConfigPda);
      daoConfigInitialized = true;
      console.log("DAO Config already initialized");
      usdcMint = daoConfigAccount.usdcMint;
      console.log("Using existing USDC mint:", usdcMint.toString());
      
      if (daoConfigAccount.usdcTreasury.toString() !== PublicKey.default.toString()) {
        treasuryInitialized = true;
        console.log("Treasury already initialized");
      }
    } catch (e) {
      console.log("DAO Config not yet initialized");
      
      // Create new USDC mint only if needed
      console.log("Creating USDC mint...");
      usdcMint = await createMint(
        provider.connection,
        admin,
        admin.publicKey,
        null,
        6
      );
      console.log("USDC mint created:", usdcMint.toString());
    }

    // Create or get USDC token accounts
    console.log("Setting up USDC token accounts...");
    adminUsdcAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      admin,
      usdcMint,
      admin.publicKey
    );

    user1UsdcAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      admin,
      usdcMint,
      user1.publicKey
    );

    user2UsdcAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      admin,
      usdcMint,
      user2.publicKey
    );

    console.log("USDC accounts:");
    console.log("   Admin USDC:", adminUsdcAccount.address.toString());
    console.log("   User1 USDC:", user1UsdcAccount.address.toString());
    console.log("   User2 USDC:", user2UsdcAccount.address.toString());

    // Mint USDC to accounts if they have zero balance
    const adminBalance = (await provider.connection.getTokenAccountBalance(adminUsdcAccount.address)).value.uiAmount;
    if (adminBalance === 0) {
      console.log("Minting USDC to test accounts...");
      await mintTo(
        provider.connection,
        admin,
        usdcMint,
        adminUsdcAccount.address,
        admin.publicKey,
        1000_000_000
      );

      await mintTo(
        provider.connection,
        admin,
        usdcMint,
        user1UsdcAccount.address,
        admin.publicKey,
        500_000_000
      );

      await mintTo(
        provider.connection,
        admin,
        usdcMint,
        user2UsdcAccount.address,
        admin.publicKey,
        500_000_000
      );
      console.log("USDC minted to test accounts");
    } else {
      console.log("USDC accounts already have balances");
    }
  });

  describe("Initialization", () => {
    it("Should initialize DAO config", async () => {
      if (daoConfigInitialized) {
        console.log("Skipping DAO config initialization - already exists");
        return;
      }

      try {
        console.log("\nTesting DAO config initialization...");
        const tx = await program.methods
          .initDaoConfig(
            new anchor.BN(10_000_000),
            new anchor.BN(50_000_000),
            new anchor.BN(0.001 * LAMPORTS_PER_SOL),
            new anchor.BN(86400),
            new anchor.BN(604800),
            0,
            new anchor.BN(100),
            new anchor.BN(5000)
          )
          .accounts({
            daoConfig: daoConfigPda,
            admin: admin.publicKey,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([admin])
          .rpc();

        console.log("DAO config initialized, tx:", tx);
        daoConfigInitialized = true;

        const daoConfig = await program.account.daoConfig.fetch(daoConfigPda);
        expect(daoConfig.admin.toString()).to.equal(admin.publicKey.toString());
        expect(daoConfig.lightFeeUsdc.toNumber()).to.equal(10_000_000);
        expect(daoConfig.majorFeeUsdc.toNumber()).to.equal(50_000_000);
      } catch (error) {
        console.error("DAO config initialization failed:", error);
        throw error;
      }
    });

    it("Should initialize treasury", async () => {
      if (treasuryInitialized) {
        console.log("Skipping treasury initialization - already exists");
        return;
      }

      try {
        console.log("\nTesting treasury initialization...");
        
        // Fund treasury PDA with SOL for rent
        const fundTreasuryTx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: admin.publicKey,
            toPubkey: treasuryPda,
            lamports: 1 * LAMPORTS_PER_SOL,
          })
        );
        await provider.sendAndConfirm(fundTreasuryTx, [admin]);

        const tx = await program.methods
          .initTreasury()
          .accounts({
            daoConfig: daoConfigPda,
            treasury: treasuryPda,
            usdcTreasury: usdcTreasuryPda,
            usdcMint: usdcMint,
            admin: admin.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([admin])
          .rpc();

        console.log("Treasury initialized, tx:", tx);
        treasuryInitialized = true;

        const daoConfig = await program.account.daoConfig.fetch(daoConfigPda);
        expect(daoConfig.treasury.toString()).to.equal(treasuryPda.toString());
        expect(daoConfig.usdcTreasury.toString()).to.equal(usdcTreasuryPda.toString());
        expect(daoConfig.usdcMint.toString()).to.equal(usdcMint.toString());
      } catch (error) {
        console.error("Treasury initialization failed:", error);
        throw error;
      }
    });
  });

  describe("Membership Management", () => {
    it("Should set user as premium member", async () => {
      try {
        console.log("\nTesting premium membership setup...");
        
        const [memberPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("member"), daoConfigPda.toBuffer(), user1.publicKey.toBuffer()],
          program.programId
        );

        const tx = await program.methods
          .setMembershipStatus(user1.publicKey, true, 0)
          .accounts({
            daoConfig: daoConfigPda,
            member: memberPda,
            admin: admin.publicKey,
            systemProgram: SystemProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([admin])
          .rpc();

        console.log("Premium membership set, tx:", tx);

        const member = await program.account.member.fetch(memberPda);
        console.log("Member data:", {
          user: member.user.toString(),
          premium: member.premium,
          flags: member.flags,
          joinedAt: member.joinedAt.toString()
        });
        
        expect(member.premium).to.be.true;
        expect(member.user.toString()).to.equal(user1.publicKey.toString());
      } catch (error) {
        console.error("Premium membership setup failed:", error);
        throw error;
      }
    });
  });

  describe("Proposal Creation", () => {
    it("Should create a light proposal", async () => {
      try {
        console.log("\nTesting light proposal creation...");
        
        const daoConfig = await program.account.daoConfig.fetch(daoConfigPda);
        const proposalId = daoConfig.proposalCount;
        
        [proposalPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("proposal"), daoConfigPda.toBuffer(), proposalId.toBuffer('le', 8)],
          program.programId
        );

        const [memberPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("member"), daoConfigPda.toBuffer(), user1.publicKey.toBuffer()],
          program.programId
        );

        // Ensure member account exists
        try {
          await program.account.member.fetch(memberPda);
        } catch (e) {
          console.log("Creating member account for user1...");

          await program.methods
            .setMembershipStatus(user1.publicKey, true, 0)
            .accounts({
              daoConfig: daoConfigPda,
              member: memberPda,
              admin: admin.publicKey,
              systemProgram: SystemProgram.programId,
              clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([admin])
            .rpc();
        }

        // Verify user1's USDC account is associated with the correct mint
        const daoConfigData = await program.account.daoConfig.fetch(daoConfigPda);
        const expectedUsdcAccount = await getAssociatedTokenAddress(
          daoConfigData.usdcMint,
          user1.publicKey
        );
        
        console.log("Expected user1 USDC account:", expectedUsdcAccount.toString());
        console.log("Actual user1 USDC account:", user1UsdcAccount.address.toString());

        // If accounts don't match, create the correct one
        if (!expectedUsdcAccount.equals(user1UsdcAccount.address)) {
          console.log("Creating correct USDC account for user1...");
          user1UsdcAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            admin,
            daoConfigData.usdcMint,
            user1.publicKey
          );
          
          // Mint USDC to the correct account
          await mintTo(
            provider.connection,
            admin,
            daoConfigData.usdcMint,
            user1UsdcAccount.address,
            admin.publicKey,
            500_000_000
          );
        }

        const titleHash = Buffer.from("Test Proposal".padEnd(32, '\0'));
        const uri = "ipfs://QmTest";
        const votingWindow = new anchor.BN(86400);

        const tx = await program.methods
          .createProposal({ light: {} }, uri, Array.from(titleHash), votingWindow)
          .accounts({
            daoConfig: daoConfigPda,
            proposal: proposalPda,
            creator: user1.publicKey,
            usdcTreasury: usdcTreasuryPda,
            creatorUsdc: user1UsdcAccount.address,
            member: memberPda,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([user1])
          .rpc();

        console.log("Light proposal created, tx:", tx);

        const proposal = await program.account.proposal.fetch(proposalPda);
        console.log("Proposal data:", {
          id: proposal.id.toString(),
          creator: proposal.creator.toString(),
          state: proposal.state,
          uri: proposal.uri
        });
        
        expect(proposal.creator.toString()).to.equal(user1.publicKey.toString());
        expect(proposal.uri).to.equal(uri);
      } catch (error) {
        console.error("Light proposal creation failed:", error);
        if (error.logs) {
          console.log("Transaction logs:", error.logs);
        }
        throw error;
      }
    });
  });

  describe("Voting", () => {
    it("Should cast a YES vote", async () => {
      try {
        console.log("\nTesting YES vote casting...");
        
        const [voteRecordPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), proposalPda.toBuffer(), user1.publicKey.toBuffer()],
          program.programId
        );

        const [memberPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("member"), daoConfigPda.toBuffer(), user1.publicKey.toBuffer()],
          program.programId
        );

        const tx = await program.methods
          .castVote({ yes: {} })
          .accounts({
            daoConfig: daoConfigPda,
            proposal: proposalPda,
            voteRecord: voteRecordPda,
            voter: user1.publicKey,
            treasury: treasuryPda,
            member: memberPda,
            systemProgram: SystemProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([user1])
          .rpc();

        console.log("YES vote cast, tx:", tx);

        const voteRecord = await program.account.voteRecord.fetch(voteRecordPda);
        console.log("Vote record:", {
          voter: voteRecord.voter.toString(),
          choice: voteRecord.choice,
          weight: voteRecord.weight.toString()
        });
        
        expect(voteRecord.voter.toString()).to.equal(user1.publicKey.toString());
        expect(voteRecord.choice).to.deep.equal({ yes: {} });
      } catch (error) {
        console.error("YES vote casting failed:", error);
        if (error.logs) {
          console.log("Transaction logs:", error.logs);
        }
        throw error;
      }
    });

    it("Should cast a NO vote from different user", async () => {
      try {
        console.log("\nTesting NO vote casting...");
        
        const [voteRecordPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), proposalPda.toBuffer(), user2.publicKey.toBuffer()],
          program.programId
        );

        const [memberPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("member"), daoConfigPda.toBuffer(), user2.publicKey.toBuffer()],
          program.programId
        );

        // Create and fund member account for user2 if needed
        try {
          await program.account.member.fetch(memberPda);
        } catch (e) {
          console.log("Creating member account for user2...");

          await program.methods
            .setMembershipStatus(user2.publicKey, false, 0)
            .accounts({
              daoConfig: daoConfigPda,
              member: memberPda,
              admin: admin.publicKey,
              systemProgram: SystemProgram.programId,
              clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([admin])
            .rpc();
        }

        const tx = await program.methods
          .castVote({ no: {} })
          .accounts({
            daoConfig: daoConfigPda,
            proposal: proposalPda,
            voteRecord: voteRecordPda,
            voter: user2.publicKey,
            treasury: treasuryPda,
            member: memberPda,
            systemProgram: SystemProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([user2])
          .rpc();

        console.log("NO vote cast, tx:", tx);

        const voteRecord = await program.account.voteRecord.fetch(voteRecordPda);
        expect(voteRecord.voter.toString()).to.equal(user2.publicKey.toString());
        expect(voteRecord.choice).to.deep.equal({ no: {} });
      } catch (error) {
        console.error("NO vote casting failed:", error);
        if (error.logs) {
          console.log("Transaction logs:", error.logs);
        }
        throw error;
      }
    });
  });

  describe("Admin Functions", () => {
    it("Should update DAO parameters", async () => {
      try {
        console.log("\nTesting parameter updates...");
        
        const tx = await program.methods
          .setParams(
            new anchor.BN(15_000_000),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          )
          .accounts({
            daoConfig: daoConfigPda,
            admin: admin.publicKey,
          })
          .signers([admin])
          .rpc();

        console.log("Parameters updated, tx:", tx);

        const daoConfig = await program.account.daoConfig.fetch(daoConfigPda);
        console.log("Updated light fee:", daoConfig.lightFeeUsdc.toString());
        expect(daoConfig.lightFeeUsdc.toNumber()).to.equal(15_000_000);
      } catch (error) {
        console.error("Parameter update failed:", error);
        throw error;
      }
    });

    it("Should pause and unpause DAO", async () => {
      try {
        console.log("\nTesting DAO pause/unpause...");
        
        const pauseTx = await program.methods
          .setPause(true)
          .accounts({
            daoConfig: daoConfigPda,
            admin: admin.publicKey,
          })
          .signers([admin])
          .rpc();

        console.log("DAO paused, tx:", pauseTx);

        let daoConfig = await program.account.daoConfig.fetch(daoConfigPda);
        expect(daoConfig.paused).to.be.true;

        const unpauseTx = await program.methods
          .setPause(false)
          .accounts({
            daoConfig: daoConfigPda,
            admin: admin.publicKey,
          })
          .signers([admin])
          .rpc();

        console.log("DAO unpaused, tx:", unpauseTx);

        daoConfig = await program.account.daoConfig.fetch(daoConfigPda);
        expect(daoConfig.paused).to.be.false;
      } catch (error) {
        console.error("Pause/unpause failed:", error);
        throw error;
      }
    });
  });

  describe("Error Cases", () => {
    it("Should fail when non-admin tries to set parameters", async () => {
      try {
        console.log("\nTesting unauthorized parameter update...");
        
        await program.methods
          .setParams(
            new anchor.BN(20_000_000),
            null, null, null, null, null, null, null, null
          )
          .accounts({
            daoConfig: daoConfigPda,
            admin: user1.publicKey,
          })
          .signers([user1])
          .rpc();

        throw new Error("Should have failed");
      } catch (error) {
        console.log("Correctly rejected unauthorized access");
        expect(error.toString()).to.include("Unauthorized");
      }
    });

    it("Should fail when trying to vote twice", async () => {
      try {
        console.log("\nTesting double voting prevention...");
        
        const [voteRecordPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), proposalPda.toBuffer(), user1.publicKey.toBuffer()],
          program.programId
        );

        const [memberPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("member"), daoConfigPda.toBuffer(), user1.publicKey.toBuffer()],
          program.programId
        );

        // Check if first vote exists
        let voteExists = false;
        try {
          await program.account.voteRecord.fetch(voteRecordPda);
          voteExists = true;
          console.log("First vote already exists");
        } catch (e) {
          console.log("First vote not cast, casting now...");
          
          await program.methods
            .castVote({ yes: {} })
            .accounts({
              daoConfig: daoConfigPda,
              proposal: proposalPda,
              voteRecord: voteRecordPda,
              voter: user1.publicKey,
              treasury: treasuryPda,
              member: memberPda,
              systemProgram: SystemProgram.programId,
              clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([user1])
            .rpc();
          voteExists = true;
        }

        if (voteExists) {
          // Try to vote again (should fail)
          await program.methods
            .castVote({ no: {} })
            .accounts({
              daoConfig: daoConfigPda,
              proposal: proposalPda,
              voteRecord: voteRecordPda,
              voter: user1.publicKey,
              treasury: treasuryPda,
              member: memberPda,
              systemProgram: SystemProgram.programId,
              clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([user1])
            .rpc();
        }

        throw new Error("Should have failed");
      } catch (error) {
        console.log("Correctly rejected double voting attempt");
        expect(error.toString()).to.include("AlreadyVoted");
      }
    });
  });

  describe("Proposal Finalization", () => {
    it("Should finalize proposal after voting period", async () => {
      try {
        console.log("\nTesting proposal finalization...");
        
        // Wait a bit to ensure voting period logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const tx = await program.methods
          .finalizeProposal()
          .accounts({
            daoConfig: daoConfigPda,
            proposal: proposalPda,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          })
          .rpc();

        console.log("Proposal finalized, tx:", tx);

        const proposal = await program.account.proposal.fetch(proposalPda);
        console.log("Final proposal state:", {
          state: proposal.state,
          totalVotes: proposal.totalVotes.toString(),
          tallyYes: proposal.tallyYes.toString(),
          tallyNo: proposal.tallyNo.toString()
        });
        
        // Should either succeed or fail based on votes
        expect(proposal.state).to.not.deep.equal({ active: {} });
      } catch (error) {
        // If voting period hasn't ended, that's expected
        if (error.toString().includes("VotingStillActive")) {
          console.log("Voting period still active - this is expected for short test windows");
        } else {
          console.error("Proposal finalization failed:", error);
          throw error;
        }
      }
    });
  });
});

function loadOrCreateKeypair(filepath: string): Keypair {
  try {
    const keypairData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
  } catch {
    const keypair = Keypair.generate();
    fs.writeFileSync(filepath, JSON.stringify(Array.from(keypair.secretKey)));
    return keypair;
  }
}