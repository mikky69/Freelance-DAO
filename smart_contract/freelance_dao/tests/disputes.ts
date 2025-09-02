import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Disputes } from "../target/types/disputes";
import { expect } from "chai";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

describe("disputes", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Disputes as Program<Disputes>;
  const provider = anchor.getProvider();

  // Test accounts
  let admin: Keypair;
  let client: Keypair;
  let freelancer: Keypair;
  let panelMember1: Keypair;
  let panelMember2: Keypair;
  let panelMember3: Keypair;

  // Program accounts
  let counterPda: PublicKey;
  let disputePda: PublicKey;
  let panelPda: PublicKey;
  let voteRecord1Pda: PublicKey;
  let voteRecord2Pda: PublicKey;
  let voteRecord3Pda: PublicKey;

  // Test data
  let disputeId: number;
  const testUri = "https://ipfs.io/ipfs/QmTestHash123";
  const panelMembers: PublicKey[] = [];
  const selectionSeed = new anchor.BN(12345);
  const requiredQuorum = 2;

  // Helper function to create dispute ID buffer
  function createDisputeIdBuffer(id: number): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(id), 0);
    return buffer;
  }

  before(async () => {
    // Generate test keypairs
    admin = Keypair.generate();
    client = Keypair.generate();
    freelancer = Keypair.generate();
    panelMember1 = Keypair.generate();
    panelMember2 = Keypair.generate();
    panelMember3 = Keypair.generate();

    panelMembers.push(panelMember1.publicKey, panelMember2.publicKey, panelMember3.publicKey);

    // Airdrop SOL to test accounts
    const accounts = [admin, client, freelancer, panelMember1, panelMember2, panelMember3];
    for (const account of accounts) {
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(account.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
      );
    }

    // Derive PDAs
    [counterPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dispute_counter")],
      program.programId
    );
  });

  it("Initializes the dispute counter", async () => {
    try {
      // Check if counter already exists
      const existingCounter = await program.account.disputeCounter.fetchNullable(counterPda);
      
      if (existingCounter) {
        console.log("Counter already exists with count:", existingCounter.count.toNumber());
        // Skip initialization if it already exists
        expect(existingCounter.count.toNumber()).to.be.greaterThanOrEqual(0);
        return;
      }

      // Initialize if it doesn't exist
      const tx = await program.methods
        .initCounter()
        .accounts({
          admin: admin.publicKey,
          counter: counterPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      const counterAccount = await program.account.disputeCounter.fetch(counterPda);
      expect(counterAccount.count.toNumber()).to.equal(0);
    } catch (error) {
      // If there's still an error about account already in use, 
      // try to fetch the existing account
      if (error.message.includes("already in use")) {
        const counterAccount = await program.account.disputeCounter.fetch(counterPda);
        expect(counterAccount.count.toNumber()).to.be.greaterThanOrEqual(0);
        console.log("Using existing counter with count:", counterAccount.count.toNumber());
      } else {
        throw error;
      }
    }
  });

  it("Opens a dispute", async () => {
    const parties = [client.publicKey, freelancer.publicKey];
    
    // Get current counter to predict dispute ID
    const counterBefore = await program.account.disputeCounter.fetch(counterPda);
    disputeId = counterBefore.count.toNumber() + 1;

    // Derive dispute PDA with proper u64 encoding
    const disputeIdBuffer = createDisputeIdBuffer(disputeId);
    [disputePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dispute"), disputeIdBuffer],
      program.programId
    );

    const tx = await program.methods
      .openDispute(parties, testUri, null)
      .accounts({
        opener: client.publicKey,
        counter: counterPda,
        dispute: disputePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    // Verify dispute was created correctly
    const disputeAccount = await program.account.dispute.fetch(disputePda);
    expect(disputeAccount.id.toNumber()).to.equal(disputeId);
    expect(disputeAccount.openedBy.toString()).to.equal(client.publicKey.toString());
    expect(disputeAccount.parties.length).to.equal(2);
    expect(disputeAccount.parties[0].toString()).to.equal(client.publicKey.toString());
    expect(disputeAccount.parties[1].toString()).to.equal(freelancer.publicKey.toString());
    expect(disputeAccount.uri).to.equal(testUri);
    expect(disputeAccount.state).to.deep.equal({ pending: {} });
    expect(disputeAccount.linkedEscrow).to.be.null;

    // Verify counter was incremented
    const counterAfter = await program.account.disputeCounter.fetch(counterPda);
    expect(counterAfter.count.toNumber()).to.equal(disputeId);
  });

  it("Forms a dispute panel", async () => {
    // Derive panel PDA with proper u64 encoding
    const disputeIdBuffer = createDisputeIdBuffer(disputeId);
    [panelPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("panel"), disputeIdBuffer],
      program.programId
    );

    const tx = await program.methods
      .formPanel(panelMembers, selectionSeed, requiredQuorum)
      .accounts({
        admin: admin.publicKey,
        dispute: disputePda,
        panel: panelPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    // Verify panel was created correctly
    const panelAccount = await program.account.disputePanel.fetch(panelPda);
    expect(panelAccount.disputeId.toNumber()).to.equal(disputeId);
    expect(panelAccount.members.length).to.equal(3);
    expect(panelAccount.weights.length).to.equal(3);
    expect(panelAccount.selectionSeed.toNumber()).to.equal(selectionSeed.toNumber());
    expect(panelAccount.totalVotesCast).to.equal(0);
    expect(panelAccount.weightedVotesCast).to.equal(0);

    // Verify dispute state was updated
    const disputeAccount = await program.account.dispute.fetch(disputePda);
    expect(disputeAccount.state).to.deep.equal({ panelFormed: {} });
    expect(disputeAccount.panelSize).to.equal(3);
    expect(disputeAccount.requiredQuorum).to.equal(requiredQuorum);
  });

  it("Panel members can cast votes", async () => {
    const disputeIdBuffer = createDisputeIdBuffer(disputeId);

    // Panel member 1 votes for Client
    [voteRecord1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("panel_vote"), disputeIdBuffer, panelMember1.publicKey.toBuffer()],
      program.programId
    );

    const tx1 = await program.methods
      .castPanelVote({ client: {} })
      .accounts({
        voter: panelMember1.publicKey,
        dispute: disputePda,
        panel: panelPda,
        voteRecord: voteRecord1Pda,
        systemProgram: SystemProgram.programId,
      })
      .signers([panelMember1])
      .rpc();

    // Panel member 2 votes for Freelancer
    [voteRecord2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("panel_vote"), disputeIdBuffer, panelMember2.publicKey.toBuffer()],
      program.programId
    );

    const tx2 = await program.methods
      .castPanelVote({ freelancer: {} })
      .accounts({
        voter: panelMember2.publicKey,
        dispute: disputePda,
        panel: panelPda,
        voteRecord: voteRecord2Pda,
        systemProgram: SystemProgram.programId,
      })
      .signers([panelMember2])
      .rpc();

    // Verify votes were recorded
    const voteRecord1 = await program.account.panelVoteRecord.fetch(voteRecord1Pda);
    expect(voteRecord1.disputeId.toNumber()).to.equal(disputeId);
    expect(voteRecord1.voter.toString()).to.equal(panelMember1.publicKey.toString());
    expect(voteRecord1.choice).to.deep.equal({ client: {} });
    expect(voteRecord1.weight).to.equal(1);

    const voteRecord2 = await program.account.panelVoteRecord.fetch(voteRecord2Pda);
    expect(voteRecord2.choice).to.deep.equal({ freelancer: {} });

    // Verify panel vote counts were updated
    const panelAccount = await program.account.disputePanel.fetch(panelPda);
    expect(panelAccount.totalVotesCast).to.equal(2);
    expect(panelAccount.weightedVotesCast).to.equal(2);
  });

  it("Finalizes judgment when quorum is reached", async () => {
    const tx = await program.methods
      .finalizeJudgment()
      .accounts({
        finalizer: admin.publicKey,
        dispute: disputePda,
        panel: panelPda,
      })
      .signers([admin])
      .rpc();

    // Verify judgment was finalized
    const disputeAccount = await program.account.dispute.fetch(disputePda);
    expect(disputeAccount.state).to.deep.equal({ judged: {} });
    expect(disputeAccount.judgment).to.not.be.null;
    
    // Note: The actual judgment choice would depend on vote tallying implementation
    // For now, we just verify that a judgment was set
    expect(disputeAccount.judgment.choice).to.not.be.undefined;
    expect(disputeAccount.judgment.finalizedAt.toNumber()).to.be.greaterThan(0);
  });

  it("Executes judgment", async () => {
    const tx = await program.methods
      .executeJudgment()
      .accounts({
        executor: admin.publicKey,
        dispute: disputePda,
        escrowProgram: null,
        escrowAccount: null,
      })
      .signers([admin])
      .rpc();

    // Verify dispute state was updated to executed
    const disputeAccount = await program.account.dispute.fetch(disputePda);
    expect(disputeAccount.state).to.deep.equal({ executed: {} });
  });

  it("Fails to vote after judgment is executed", async () => {
    const disputeIdBuffer = createDisputeIdBuffer(disputeId);

    // Try to cast another vote after judgment is executed
    [voteRecord3Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("panel_vote"), disputeIdBuffer, panelMember3.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .castPanelVote({ client: {} })
        .accounts({
          voter: panelMember3.publicKey,
          dispute: disputePda,
          panel: panelPda,
          voteRecord: voteRecord3Pda,
          systemProgram: SystemProgram.programId,
        })
        .signers([panelMember3])
        .rpc();
      
      expect.fail("Should have failed to vote after execution");
    } catch (error) {
      // The error will be about invalid dispute state since it's executed
      expect(error.message).to.include("InvalidDisputeState");
    }
  });

  it("Fails to open dispute with invalid parties", async () => {
    try {
      const invalidParties = [client.publicKey]; // Only one party
      const counterBefore = await program.account.disputeCounter.fetch(counterPda);
      const invalidDisputeId = counterBefore.count.toNumber() + 1;
      const invalidDisputeIdBuffer = createDisputeIdBuffer(invalidDisputeId);
      
      const [invalidDisputePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("dispute"), invalidDisputeIdBuffer],
        program.programId
      );
      
      await program.methods
        .openDispute(invalidParties, testUri, null)
        .accounts({
          opener: client.publicKey,
          counter: counterPda,
          dispute: invalidDisputePda,
          systemProgram: SystemProgram.programId,
        })
        .signers([client])
        .rpc();
      
      expect.fail("Should have failed with invalid parties");
    } catch (error) {
      expect(error.message).to.include("InvalidParties");
    }
  });

  it("Fails to form panel with invalid quorum", async () => {
    // Open another dispute for this test
    const parties = [client.publicKey, freelancer.publicKey];
    const counterBefore = await program.account.disputeCounter.fetch(counterPda);
    const newDisputeId = counterBefore.count.toNumber() + 1;
    const newDisputeIdBuffer = createDisputeIdBuffer(newDisputeId);
    
    const [newDisputePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dispute"), newDisputeIdBuffer],
      program.programId
    );

    await program.methods
      .openDispute(parties, testUri, null)
      .accounts({
        opener: client.publicKey,
        counter: counterPda,
        dispute: newDisputePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    // Try to form panel with invalid quorum (greater than panel size)
    const [newPanelPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("panel"), newDisputeIdBuffer],
      program.programId
    );

    try {
      await program.methods
        .formPanel(panelMembers, selectionSeed, 5) // Quorum > panel size
        .accounts({
          admin: admin.publicKey,
          dispute: newDisputePda,
          panel: newPanelPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
      
      expect.fail("Should have failed with invalid quorum");
    } catch (error) {
      expect(error.message).to.include("InvalidPanelSize");
    }
  });

  it("Fails when non-panel member tries to vote", async () => {
    const nonMember = Keypair.generate();
    
    // Airdrop SOL to non-member
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(nonMember.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Open another dispute and form panel for this test
    const parties = [client.publicKey, freelancer.publicKey];
    const counterBefore = await program.account.disputeCounter.fetch(counterPda);
    const newDisputeId = counterBefore.count.toNumber() + 1;
    const newDisputeIdBuffer = createDisputeIdBuffer(newDisputeId);
    
    const [newDisputePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dispute"), newDisputeIdBuffer],
      program.programId
    );

    const [newPanelPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("panel"), newDisputeIdBuffer],
      program.programId
    );

    // Open dispute
    await program.methods
      .openDispute(parties, testUri, null)
      .accounts({
        opener: client.publicKey,
        counter: counterPda,
        dispute: newDisputePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    // Form panel
    await program.methods
      .formPanel(panelMembers, selectionSeed, requiredQuorum)
      .accounts({
        admin: admin.publicKey,
        dispute: newDisputePda,
        panel: newPanelPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    // Try to vote as non-member
    const [nonMemberVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("panel_vote"), newDisputeIdBuffer, nonMember.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .castPanelVote({ client: {} })
        .accounts({
          voter: nonMember.publicKey,
          dispute: newDisputePda,
          panel: newPanelPda,
          voteRecord: nonMemberVotePda,
          systemProgram: SystemProgram.programId,
        })
        .signers([nonMember])
        .rpc();
      
      expect.fail("Should have failed when non-panel member tries to vote");
    } catch (error) {
      expect(error.message).to.include("NotPanelMember");
    }
  });
});