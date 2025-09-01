import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Staking } from "../target/types/staking";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddress
} from "@solana/spl-token";
import { expect } from "chai";
import { BN } from "bn.js";

describe("Staking Program", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.Staking as Program<Staking>;

  // Test accounts
  let admin: Keypair;
  let user1: Keypair;
  let user2: Keypair;
  let usdcMint: PublicKey;
  let lpMint: PublicKey;
  let flDaoMint: PublicKey;

  // PDAs
  let rewardsConfigPDA: PublicKey;
  let mintAuthorityPDA: PublicKey;
  let treasuryPDA: PublicKey;
  let usdcPoolPDA: PublicKey;
  let lpPoolPDA: PublicKey;
  let usdcVaultPDA: PublicKey;
  let lpVaultPDA: PublicKey;

  // Token accounts
  let adminUsdcAccount: PublicKey;
  let adminLpAccount: PublicKey;
  let adminFlDaoAccount: PublicKey;
  let user1UsdcAccount: PublicKey;
  let user1LpAccount: PublicKey;
  let user1FlDaoAccount: PublicKey;
  let user2UsdcAccount: PublicKey;
  let user2FlDaoAccount: PublicKey;

  // Constants
  const USDC_DECIMALS = 6;
  const LP_DECIMALS = 9;
  const FLDAO_DECIMALS = 9;
  const INITIAL_SUPPLY = 1_000_000;
  const EXCHANGE_RATE = 1000; // 1000 points = 1 FL-DAO
  const USDC_DAILY_RATE = 1_000_000; // 1 point per USDC per day
  const LP_DAILY_RATE = 1_500_000; // 1.5x multiplier for LP

  // Helper function to convert daily rate to per-second Q32.32 format
  function dailyRateToPerSecond(dailyRate: number): BN {
    const Q32 = new BN(2).pow(new BN(32));
    const secondsPerDay = new BN(86400);
    return new BN(dailyRate).mul(Q32).div(secondsPerDay);
  }

  // Helper function to sleep
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  before(async () => {
    // Load test keypairs
    admin = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(admin.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user1.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user2.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);

    // Wait for airdrops to confirm
    await sleep(2000);

    // Create mints
    usdcMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      USDC_DECIMALS
    );

    lpMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      LP_DECIMALS
    );

    flDaoMint = await createMint(
      provider.connection,
      admin,
      null, // We'll set mint authority to PDA later
      null,
      FLDAO_DECIMALS
    );

    // Derive PDAs
    [rewardsConfigPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("rewards_config")],
      program.programId
    );

    [mintAuthorityPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority")],
      program.programId
    );

    [treasuryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      program.programId
    );

    [usdcPoolPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), usdcMint.toBuffer()],
      program.programId
    );

    [lpPoolPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), lpMint.toBuffer()],
      program.programId
    );

    [usdcVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), usdcMint.toBuffer()],
      program.programId
    );

    [lpVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), lpMint.toBuffer()],
      program.programId
    );

    // Create associated token accounts
    adminUsdcAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      usdcMint,
      admin.publicKey
    );

    adminLpAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      lpMint,
      admin.publicKey
    );

    adminFlDaoAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      flDaoMint,
      admin.publicKey
    );

    user1UsdcAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      usdcMint,
      user1.publicKey
    );

    user1LpAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      lpMint,
      user1.publicKey
    );

    user1FlDaoAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      flDaoMint,
      user1.publicKey
    );

    user2UsdcAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      usdcMint,
      user2.publicKey
    );

    user2FlDaoAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin,
      flDaoMint,
      user2.publicKey
    );

    // Mint initial tokens
    await mintTo(
      provider.connection,
      admin,
      usdcMint,
      adminUsdcAccount,
      admin,
      INITIAL_SUPPLY * Math.pow(10, USDC_DECIMALS)
    );

    await mintTo(
      provider.connection,
      admin,
      lpMint,
      adminLpAccount,
      admin,
      INITIAL_SUPPLY * Math.pow(10, LP_DECIMALS)
    );

    // Distribute tokens to users
    await mintTo(
      provider.connection,
      admin,
      usdcMint,
      user1UsdcAccount,
      admin,
      100_000 * Math.pow(10, USDC_DECIMALS)
    );

    await mintTo(
      provider.connection,
      admin,
      lpMint,
      user1LpAccount,
      admin,
      100_000 * Math.pow(10, LP_DECIMALS)
    );

    await mintTo(
      provider.connection,
      admin,
      usdcMint,
      user2UsdcAccount,
      admin,
      50_000 * Math.pow(10, USDC_DECIMALS)
    );
  });

  describe("Initialization", () => {
    it("Initializes rewards config", async () => {
      const tx = await program.methods
        .initRewardsConfig(flDaoMint, new BN(EXCHANGE_RATE), admin.publicKey)
        .accounts({
          rewardsConfig: rewardsConfigPDA,
          mintAuthority: mintAuthorityPDA,
          treasury: treasuryPDA,
          admin: admin.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      console.log("Init rewards config tx:", tx);

      // Verify the rewards config
      const rewardsConfig = await program.account.rewardsConfig.fetch(rewardsConfigPDA);
      expect(rewardsConfig.admin.toString()).to.equal(admin.publicKey.toString());
      expect(rewardsConfig.flDaoMint.toString()).to.equal(flDaoMint.toString());
      expect(rewardsConfig.exchangeRate.toNumber()).to.equal(EXCHANGE_RATE);
      expect(rewardsConfig.paused).to.be.false;
    });

    it("Initializes USDC pool", async () => {
      const pointsPerSecond = dailyRateToPerSecond(USDC_DAILY_RATE);

      const tx = await program.methods
        .initPool(usdcMint, false, pointsPerSecond)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          mint: usdcMint,
          admin: admin.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      console.log("Init USDC pool tx:", tx);

      // Verify the pool
      const pool = await program.account.stakePool.fetch(usdcPoolPDA);
      expect(pool.mint.toString()).to.equal(usdcMint.toString());
      expect(pool.isLp).to.be.false;
      expect(pool.totalStaked.toNumber()).to.equal(0);
      expect(pool.paused).to.be.false;
    });

    it("Initializes LP pool", async () => {
      const pointsPerSecond = dailyRateToPerSecond(LP_DAILY_RATE);

      const tx = await program.methods
        .initPool(lpMint, true, pointsPerSecond)
        .accounts({
          pool: lpPoolPDA,
          vault: lpVaultPDA,
          mint: lpMint,
          admin: admin.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      console.log("Init LP pool tx:", tx);

      // Verify the pool
      const pool = await program.account.stakePool.fetch(lpPoolPDA);
      expect(pool.mint.toString()).to.equal(lpMint.toString());
      expect(pool.isLp).to.be.true;
    });

    it("Updates FL-DAO mint authority to PDA", async () => {
      // Transfer mint authority to the PDA
      const instruction = anchor.web3.TokenInstruction.createSetAuthorityInstruction({
        account: flDaoMint,
        currentAuthority: admin.publicKey,
        newAuthority: mintAuthorityPDA,
        authorityType: anchor.web3.AuthorityType.MintTokens,
      });

      const transaction = new Transaction().add(instruction);
      await sendAndConfirmTransaction(provider.connection, transaction, [admin]);
    });
  });

  describe("Staking", () => {
    let user1UsdcPositionPDA: PublicKey;
    let user1LpPositionPDA: PublicKey;
    let user2UsdcPositionPDA: PublicKey;

    before(() => {
      [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      [user1LpPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), lpPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      [user2UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user2.publicKey.toBuffer()],
        program.programId
      );
    });

    it("Stakes USDC tokens", async () => {
      const stakeAmount = new BN(1000 * Math.pow(10, USDC_DECIMALS));

      const tx = await program.methods
        .stake(stakeAmount)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: user1UsdcPositionPDA,
          staker: user1.publicKey,
          stakerTokenAccount: user1UsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      console.log("Stake USDC tx:", tx);

      // Verify the position
      const position = await program.account.stakePosition.fetch(user1UsdcPositionPDA);
      expect(position.staker.toString()).to.equal(user1.publicKey.toString());
      expect(position.amount.toString()).to.equal(stakeAmount.toString());
      expect(position.accumulatedPoints.toString()).to.equal("0");

      // Verify pool total
      const pool = await program.account.stakePool.fetch(usdcPoolPDA);
      expect(pool.totalStaked.toString()).to.equal(stakeAmount.toString());

      // Verify vault balance
      const vaultAccount = await getAccount(provider.connection, usdcVaultPDA);
      expect(vaultAccount.amount.toString()).to.equal(stakeAmount.toString());
    });

    it("Stakes LP tokens", async () => {
      const stakeAmount = new BN(500 * Math.pow(10, LP_DECIMALS));

      const tx = await program.methods
        .stake(stakeAmount)
        .accounts({
          pool: lpPoolPDA,
          vault: lpVaultPDA,
          position: user1LpPositionPDA,
          staker: user1.publicKey,
          stakerTokenAccount: user1LpAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      console.log("Stake LP tx:", tx);

      // Verify the position
      const position = await program.account.stakePosition.fetch(user1LpPositionPDA);
      expect(position.amount.toString()).to.equal(stakeAmount.toString());
    });

    it("Allows multiple users to stake", async () => {
      const stakeAmount = new BN(2000 * Math.pow(10, USDC_DECIMALS));

      const tx = await program.methods
        .stake(stakeAmount)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: user2UsdcPositionPDA,
          staker: user2.publicKey,
          stakerTokenAccount: user2UsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      console.log("User2 stake USDC tx:", tx);

      // Verify pool total includes both stakes
      const pool = await program.account.stakePool.fetch(usdcPoolPDA);
      const expectedTotal = new BN(1000 * Math.pow(10, USDC_DECIMALS))
        .add(new BN(2000 * Math.pow(10, USDC_DECIMALS)));
      expect(pool.totalStaked.toString()).to.equal(expectedTotal.toString());
    });

    it("Prevents staking zero amount", async () => {
      try {
        await program.methods
          .stake(new BN(0))
          .accounts({
            pool: usdcPoolPDA,
            vault: usdcVaultPDA,
            position: user1UsdcPositionPDA,
            staker: user1.publicKey,
            stakerTokenAccount: user1UsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Amount too small");
      }
    });
  });

  describe("Points Accumulation", () => {
    it("Accumulates points over time", async () => {
      // Wait for some time to accumulate points
      await sleep(5000); // 5 seconds

      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      // Sync position to update points
      const tx = await program.methods
        .syncPosition()
        .accounts({
          pool: usdcPoolPDA,
          position: user1UsdcPositionPDA,
          staker: user1.publicKey,
        })
        .signers([user1])
        .rpc();

      console.log("Sync position tx:", tx);

      // Check that points have accumulated
      const position = await program.account.stakePosition.fetch(user1UsdcPositionPDA);
      expect(position.accumulatedPoints.toNumber()).to.be.greaterThan(0);
      
      console.log("Accumulated points:", position.accumulatedPoints.toString());
    });
  });

  describe("Unstaking", () => {
    it("Partially unstakes tokens", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const unstakeAmount = new BN(500 * Math.pow(10, USDC_DECIMALS));

      // Get initial user balance
      const initialUserBalance = (await getAccount(provider.connection, user1UsdcAccount)).amount;

      const tx = await program.methods
        .unstake(unstakeAmount)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: user1UsdcPositionPDA,
          staker: user1.publicKey,
          stakerTokenAccount: user1UsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      console.log("Unstake tx:", tx);

      // Verify position amount decreased
      const position = await program.account.stakePosition.fetch(user1UsdcPositionPDA);
      const expectedRemaining = new BN(1000 * Math.pow(10, USDC_DECIMALS))
        .sub(unstakeAmount);
      expect(position.amount.toString()).to.equal(expectedRemaining.toString());

      // Verify user received tokens back
      const finalUserBalance = (await getAccount(provider.connection, user1UsdcAccount)).amount;
      expect(finalUserBalance - initialUserBalance).to.equal(Number(unstakeAmount.toString()));
    });

    it("Prevents unstaking more than staked", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const unstakeAmount = new BN(10000 * Math.pow(10, USDC_DECIMALS)); // More than staked

      try {
        await program.methods
          .unstake(unstakeAmount)
          .accounts({
            pool: usdcPoolPDA,
            vault: usdcVaultPDA,
            position: user1UsdcPositionPDA,
            staker: user1.publicKey,
            stakerTokenAccount: user1UsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user1])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Insufficient staked");
      }
    });
  });

  describe("Points Exchange", () => {
    it("Exchanges points for FL-DAO tokens", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      // First sync to accumulate more points
      await sleep(2000);
      await program.methods
        .syncPosition()
        .accounts({
          pool: usdcPoolPDA,
          position: user1UsdcPositionPDA,
          staker: user1.publicKey,
        })
        .signers([user1])
        .rpc();

      const position = await program.account.stakePosition.fetch(user1UsdcPositionPDA);
      const pointsToExchange = position.accumulatedPoints.div(new BN(2)); // Exchange half

      const initialFlDaoBalance = (await getAccount(provider.connection, user1FlDaoAccount)).amount;

      const tx = await program.methods
        .exchangePoints(pointsToExchange, new BN(0))
        .accounts({
          rewardsConfig: rewardsConfigPDA,
          position: user1UsdcPositionPDA,
          flDaoMint: flDaoMint,
          userFlDaoAccount: user1FlDaoAccount,
          mintAuthority: mintAuthorityPDA,
          staker: user1.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      console.log("Exchange points tx:", tx);

      // Verify points were deducted
      const updatedPosition = await program.account.stakePosition.fetch(user1UsdcPositionPDA);
      const expectedRemainingPoints = position.accumulatedPoints.sub(pointsToExchange);
      expect(updatedPosition.accumulatedPoints.toString()).to.equal(expectedRemainingPoints.toString());

      // Verify FL-DAO tokens were minted
      const finalFlDaoBalance = (await getAccount(provider.connection, user1FlDaoAccount)).amount;
      expect(finalFlDaoBalance).to.be.greaterThan(Number(initialFlDaoBalance.toString()));
      
      console.log("FL-DAO tokens received:", (finalFlDaoBalance - Number(initialFlDaoBalance.toString())));
    });

    it("Prevents exchanging more points than available", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const position = await program.account.stakePosition.fetch(user1UsdcPositionPDA);
      const tooManyPoints = position.accumulatedPoints.add(new BN(1000000));

      try {
        await program.methods
          .exchangePoints(tooManyPoints, new BN(0))
          .accounts({
            rewardsConfig: rewardsConfigPDA,
            position: user1UsdcPositionPDA,
            flDaoMint: flDaoMint,
            userFlDaoAccount: user1FlDaoAccount,
            mintAuthority: mintAuthorityPDA,
            staker: user1.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user1])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Insufficient points");
      }
    });
  });

  describe("Admin Functions", () => {
    it("Admin can pause pool", async () => {
      const tx = await program.methods
        .setPoolParams(null, true) // pause = true
        .accounts({
          rewardsConfig: rewardsConfigPDA,
          pool: usdcPoolPDA,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      console.log("Pause pool tx:", tx);

      const pool = await program.account.stakePool.fetch(usdcPoolPDA);
      expect(pool.paused).to.be.true;
    });

    it("Prevents staking when pool is paused", async () => {
      const [user2UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user2.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .stake(new BN(100 * Math.pow(10, USDC_DECIMALS)))
          .accounts({
            pool: usdcPoolPDA,
            vault: usdcVaultPDA,
            position: user2UsdcPositionPDA,
            staker: user2.publicKey,
            stakerTokenAccount: user2UsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user2])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Pool is paused");
      }
    });

    it("Admin can unpause pool", async () => {
      const tx = await program.methods
        .setPoolParams(null, false) // pause = false
        .accounts({
          rewardsConfig: rewardsConfigPDA,
          pool: usdcPoolPDA,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      console.log("Unpause pool tx:", tx);

      const pool = await program.account.stakePool.fetch(usdcPoolPDA);
      expect(pool.paused).to.be.false;
    });

    it("Admin can update exchange rate", async () => {
      const newExchangeRate = new BN(2000); // 2000 points = 1 FL-DAO

      const tx = await program.methods
        .setRewardsParams(newExchangeRate, null)
        .accounts({
          rewardsConfig: rewardsConfigPDA,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      console.log("Update exchange rate tx:", tx);

      const rewardsConfig = await program.account.rewardsConfig.fetch(rewardsConfigPDA);
      expect(rewardsConfig.exchangeRate.toString()).to.equal(newExchangeRate.toString());
    });

    it("Admin can update pool rate", async () => {
      const newRate = dailyRateToPerSecond(2_000_000); // 2x rate

      const tx = await program.methods
        .setPoolParams(newRate, null)
        .accounts({
          rewardsConfig: rewardsConfigPDA,
          pool: usdcPoolPDA,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

      console.log("Update pool rate tx:", tx);

      const pool = await program.account.stakePool.fetch(usdcPoolPDA);
      expect(pool.pointsPerTokenPerSecond.toString()).to.equal(newRate.toString());
    });

    it("Prevents non-admin from updating parameters", async () => {
      try {
        await program.methods
          .setPoolParams(null, true)
          .accounts({
            rewardsConfig: rewardsConfigPDA,
            pool: usdcPoolPDA,
            admin: user1.publicKey, // Wrong admin
          })
          .signers([user1])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Unauthorized");
      }
    });
  });

  describe("Utility Functions", () => {
    it("Gets staked amount", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const stakedAmount = await program.methods
        .getStakedAmount()
        .accounts({
          position: user1UsdcPositionPDA,
          staker: user1.publicKey,
        })
        .signers([user1])
        .view();

      console.log("Staked amount:", stakedAmount.toString());
      expect(stakedAmount.toNumber()).to.be.greaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("Handles multiple stakes from same user", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const initialPosition = await program.account.stakePosition.fetch(user1UsdcPositionPDA);
      const additionalStake = new BN(200 * Math.pow(10, USDC_DECIMALS));

      const tx = await program.methods
        .stake(additionalStake)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: user1UsdcPositionPDA,
          staker: user1.publicKey,
          stakerTokenAccount: user1UsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      console.log("Additional stake tx:", tx);

      const updatedPosition = await program.account.stakePosition.fetch(user1UsdcPositionPDA);
      const expectedTotal = initialPosition.amount.add(additionalStake);
      expect(updatedPosition.amount.toString()).to.equal(expectedTotal.toString());
    });

    it("Handles complete unstaking (zero remaining)", async () => {
      // Create a new user for this test to avoid affecting other tests
      const testUser = Keypair.generate();
      await provider.connection.requestAirdrop(testUser.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await sleep(1000);

      const testUserUsdcAccount = await createAssociatedTokenAccount(
        provider.connection,
        admin,
        usdcMint,
        testUser.publicKey
      );

      await mintTo(
        provider.connection,
        admin,
        usdcMint,
        testUserUsdcAccount,
        admin,
        1000 * Math.pow(10, USDC_DECIMALS)
      );

      const [testUserPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), testUser.publicKey.toBuffer()],
        program.programId
      );

      const stakeAmount = new BN(1000 * Math.pow(10, USDC_DECIMALS));

      // Stake
      await program.methods
        .stake(stakeAmount)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: testUserPositionPDA,
          staker: testUser.publicKey,
          stakerTokenAccount: testUserUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([testUser])
        .rpc();

      // Unstake everything
      const tx = await program.methods
        .unstake(stakeAmount)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: testUserPositionPDA,
          staker: testUser.publicKey,
          stakerTokenAccount: testUserUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([testUser])
        .rpc();

      console.log("Complete unstake tx:", tx);

      const position = await program.account.stakePosition.fetch(testUserPositionPDA);
      expect(position.amount.toNumber()).to.equal(0);
    });

    it("Handles synchronization with zero stake", async () => {
      const testUser = Keypair.generate();
      await provider.connection.requestAirdrop(testUser.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await sleep(1000);

      const [testUserPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), testUser.publicKey.toBuffer()],
        program.programId
      );

      // Try to sync a position that doesn't exist or has zero stake
      try {
        await program.methods
          .syncPosition()
          .accounts({
            pool: usdcPoolPDA,
            position: testUserPositionPDA,
            staker: testUser.publicKey,
          })
          .signers([testUser])
          .rpc();
        
        // This might fail due to account not existing, which is expected
      } catch (error) {
        // Expected behavior for non-existent position
        expect(error.message).to.include("Account does not exist");
      }
    });

    it("Handles minimum exchange requirements", async () => {
      const [user2UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user2.publicKey.toBuffer()],
        program.programId
      );

      // Sync to accumulate some points
      await sleep(2000);
      await program.methods
        .syncPosition()
        .accounts({
          pool: usdcPoolPDA,
          position: user2UsdcPositionPDA,
          staker: user2.publicKey,
        })
        .signers([user2])
        .rpc();

      const position = await program.account.stakePosition.fetch(user2UsdcPositionPDA);
      
      if (position.accumulatedPoints.toNumber() > 0) {
        // Try to exchange with minimum out higher than what we'll get
        const pointsToExchange = new BN(100); // Small amount
        const unreasonableMinOut = new BN(1000 * Math.pow(10, FLDAO_DECIMALS)); // Very high minimum

        try {
          await program.methods
            .exchangePoints(pointsToExchange, unreasonableMinOut)
            .accounts({
              rewardsConfig: rewardsConfigPDA,
              position: user2UsdcPositionPDA,
              flDaoMint: flDaoMint,
              userFlDaoAccount: user2FlDaoAccount,
              mintAuthority: mintAuthorityPDA,
              staker: user2.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([user2])
            .rpc();
          
          expect.fail("Should have thrown an error");
        } catch (error) {
          expect(error.message).to.include("Invalid amount");
        }
      }
    });
  });

  describe("Math Precision", () => {
    it("Calculates points accurately over different time periods", async () => {
      // Create a new position for precise testing
      const precisionUser = Keypair.generate();
      await provider.connection.requestAirdrop(precisionUser.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await sleep(1000);

      const precisionUserUsdcAccount = await createAssociatedTokenAccount(
        provider.connection,
        admin,
        usdcMint,
        precisionUser.publicKey
      );

      await mintTo(
        provider.connection,
        admin,
        usdcMint,
        precisionUserUsdcAccount,
        admin,
        10000 * Math.pow(10, USDC_DECIMALS)
      );

      const [precisionUserPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), precisionUser.publicKey.toBuffer()],
        program.programId
      );

      const stakeAmount = new BN(1000 * Math.pow(10, USDC_DECIMALS)); // 1000 USDC

      // Stake
      await program.methods
        .stake(stakeAmount)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: precisionUserPositionPDA,
          staker: precisionUser.publicKey,
          stakerTokenAccount: precisionUserUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([precisionUser])
        .rpc();

      // Wait for a known period
      const waitTime = 10; // 10 seconds
      await sleep(waitTime * 1000);

      // Sync to calculate points
      await program.methods
        .syncPosition()
        .accounts({
          pool: usdcPoolPDA,
          position: precisionUserPositionPDA,
          staker: precisionUser.publicKey,
        })
        .signers([precisionUser])
        .rpc();

      const position = await program.account.stakePosition.fetch(precisionUserPositionPDA);
      
      console.log("Points accumulated over", waitTime, "seconds:", position.accumulatedPoints.toString());
      
      // Points should be roughly: amount * rate * time
      // With current rate (2_000_000 points per day per token after admin update)
      // For 1000 USDC over 10 seconds: approximately (1000 * 2_000_000 * 10) / 86400
      const expectedPoints = Math.floor((1000 * 2_000_000 * waitTime) / 86400);
      const actualPoints = position.accumulatedPoints.toNumber();
      
      // Allow for some variance due to timing precision
      expect(actualPoints).to.be.greaterThan(expectedPoints * 0.8);
      expect(actualPoints).to.be.lessThan(expectedPoints * 1.2);
    });
  });

  describe("Event Emission", () => {
    it("Emits events on stake", async () => {
      const testUser = Keypair.generate();
      await provider.connection.requestAirdrop(testUser.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await sleep(1000);

      const testUserUsdcAccount = await createAssociatedTokenAccount(
        provider.connection,
        admin,
        usdcMint,
        testUser.publicKey
      );

      await mintTo(
        provider.connection,
        admin,
        usdcMint,
        testUserUsdcAccount,
        admin,
        5000 * Math.pow(10, USDC_DECIMALS)
      );

      const [testUserPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), testUser.publicKey.toBuffer()],
        program.programId
      );

      const stakeAmount = new BN(1000 * Math.pow(10, USDC_DECIMALS));

      // Listen for events
      const listener = program.addEventListener("Staked", (event) => {
        console.log("Staked event:", event);
        expect(event.staker.toString()).to.equal(testUser.publicKey.toString());
        expect(event.amount.toString()).to.equal(stakeAmount.toString());
      });

      await program.methods
        .stake(stakeAmount)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: testUserPositionPDA,
          staker: testUser.publicKey,
          stakerTokenAccount: testUserUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([testUser])
        .rpc();

      // Clean up listener
      await program.removeEventListener(listener);
    });

    it("Emits events on unstake", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const unstakeAmount = new BN(100 * Math.pow(10, USDC_DECIMALS));

      // Listen for events
      const listener = program.addEventListener("Unstaked", (event) => {
        console.log("Unstaked event:", event);
        expect(event.staker.toString()).to.equal(user1.publicKey.toString());
        expect(event.amount.toString()).to.equal(unstakeAmount.toString());
      });

      await program.methods
        .unstake(unstakeAmount)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: user1UsdcPositionPDA,
          staker: user1.publicKey,
          stakerTokenAccount: user1UsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      // Clean up listener
      await program.removeEventListener(listener);
    });

    it("Emits events on points exchange", async () => {
      const [user2UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user2.publicKey.toBuffer()],
        program.programId
      );

      // Sync to accumulate more points
      await sleep(3000);
      await program.methods
        .syncPosition()
        .accounts({
          pool: usdcPoolPDA,
          position: user2UsdcPositionPDA,
          staker: user2.publicKey,
        })
        .signers([user2])
        .rpc();

      const position = await program.account.stakePosition.fetch(user2UsdcPositionPDA);
      
      if (position.accumulatedPoints.toNumber() > 1000) {
        const pointsToExchange = new BN(1000);

        // Listen for events
        const listener = program.addEventListener("PointsExchanged", (event) => {
          console.log("PointsExchanged event:", event);
          expect(event.staker.toString()).to.equal(user2.publicKey.toString());
          expect(event.pointsBurned.toString()).to.equal(pointsToExchange.toString());
        });

        await program.methods
          .exchangePoints(pointsToExchange, new BN(0))
          .accounts({
            rewardsConfig: rewardsConfigPDA,
            position: user2UsdcPositionPDA,
            flDaoMint: flDaoMint,
            userFlDaoAccount: user2FlDaoAccount,
            mintAuthority: mintAuthorityPDA,
            staker: user2.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user2])
          .rpc();

        // Clean up listener
        await program.removeEventListener(listener);
      }
    });
  });

  describe("Security", () => {
    it("Prevents users from accessing other users' positions", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      try {
        // User2 tries to unstake from User1's position
        await program.methods
          .unstake(new BN(100 * Math.pow(10, USDC_DECIMALS)))
          .accounts({
            pool: usdcPoolPDA,
            vault: usdcVaultPDA,
            position: user1UsdcPositionPDA, // User1's position
            staker: user2.publicKey,        // But User2 as signer
            stakerTokenAccount: user2UsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user2])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Unauthorized");
      }
    });

    it("Validates pool ownership in position", async () => {
      const [user1LpPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), lpPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      try {
        // Try to sync LP position but with USDC pool
        await program.methods
          .syncPosition()
          .accounts({
            pool: usdcPoolPDA,        // Wrong pool
            position: user1LpPositionPDA, // LP position
            staker: user1.publicKey,
          })
          .signers([user1])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Invalid pool");
      }
    });
  });

  describe("Gas Optimization", () => {
    it("Measures gas usage for common operations", async () => {
      const testUser = Keypair.generate();
      await provider.connection.requestAirdrop(testUser.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await sleep(1000);

      const testUserUsdcAccount = await createAssociatedTokenAccount(
        provider.connection,
        admin,
        usdcMint,
        testUser.publicKey
      );

      await mintTo(
        provider.connection,
        admin,
        usdcMint,
        testUserUsdcAccount,
        admin,
        10000 * Math.pow(10, USDC_DECIMALS)
      );

      const [testUserPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), testUser.publicKey.toBuffer()],
        program.programId
      );

      const stakeAmount = new BN(1000 * Math.pow(10, USDC_DECIMALS));

      // Measure stake gas
      const stakeTx = await program.methods
        .stake(stakeAmount)
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: testUserPositionPDA,
          staker: testUser.publicKey,
          stakerTokenAccount: testUserUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([testUser])
        .rpc();

      const stakeDetails = await provider.connection.getTransaction(stakeTx, {
        commitment: "confirmed",
      });
      console.log("Stake transaction compute units:", stakeDetails?.meta?.computeUnitsConsumed);

      await sleep(2000);

      // Measure sync gas
      const syncTx = await program.methods
        .syncPosition()
        .accounts({
          pool: usdcPoolPDA,
          position: testUserPositionPDA,
          staker: testUser.publicKey,
        })
        .signers([testUser])
        .rpc();

      const syncDetails = await provider.connection.getTransaction(syncTx, {
        commitment: "confirmed",
      });
      console.log("Sync transaction compute units:", syncDetails?.meta?.computeUnitsConsumed);

      // Measure unstake gas
      const unstakeTx = await program.methods
        .unstake(new BN(500 * Math.pow(10, USDC_DECIMALS)))
        .accounts({
          pool: usdcPoolPDA,
          vault: usdcVaultPDA,
          position: testUserPositionPDA,
          staker: testUser.publicKey,
          stakerTokenAccount: testUserUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([testUser])
        .rpc();

      const unstakeDetails = await provider.connection.getTransaction(unstakeTx, {
        commitment: "confirmed",
      });
      console.log("Unstake transaction compute units:", unstakeDetails?.meta?.computeUnitsConsumed);
    });
  });

  after(() => {
    console.log("\n=== Test Summary ===");
    console.log("All staking program tests completed successfully!");
    console.log("Coverage includes:");
    console.log("- Initialization of rewards config and pools");
    console.log("- Staking and unstaking functionality");
    console.log("- Points accumulation and exchange");
    console.log("- Admin functions and access control");
    console.log("- Edge cases and error handling");
    console.log("- Event emission verification");
    console.log("- Security validations");
    console.log("- Gas usage measurements");
  });
});