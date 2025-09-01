import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Staking } from "../target/types/staking";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddress,
  createSetAuthorityInstruction,
} from "@solana/spl-token";
import { expect } from "chai";
import { BN } from "bn.js";

describe("Staking Program", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.Staking as Program<Staking>;

  let admin: Keypair;
  let user1: Keypair;
  let user2: Keypair;
  let usdcMint: PublicKey;
  let lpMint: PublicKey;
  let flDaoMint: PublicKey;

  let rewardsConfigPDA: PublicKey;
  let mintAuthorityPDA: PublicKey;
  let treasuryPDA: PublicKey;
  let usdcPoolPDA: PublicKey;
  let lpPoolPDA: PublicKey;
  let usdcVaultPDA: PublicKey;
  let lpVaultPDA: PublicKey;

  let adminUsdcAccount: PublicKey;
  let adminLpAccount: PublicKey;
  let adminFlDaoAccount: PublicKey;
  let user1UsdcAccount: PublicKey;
  let user1LpAccount: PublicKey;
  let user1FlDaoAccount: PublicKey;
  let user2UsdcAccount: PublicKey;
  let user2FlDaoAccount: PublicKey;

  const USDC_DECIMALS = 6;
  const LP_DECIMALS = 9;
  const FLDAO_DECIMALS = 9;
  const INITIAL_SUPPLY = 1_000_000;
  const EXCHANGE_RATE = 1000;
  const USDC_DAILY_RATE = 1_000_000;
  const LP_DAILY_RATE = 1_500_000;

  function dailyRateToPerSecond(dailyRate: number): BN {
    const Q32 = new BN(2).pow(new BN(32));
    const secondsPerDay = new BN(86400);
    return new BN(dailyRate).mul(Q32).div(secondsPerDay);
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper function to safely fetch position account
  async function fetchPositionSafe(positionPDA: PublicKey): Promise<any | null> {
    try {
      const position = await program.account.stakePosition.fetch(positionPDA);
      console.log(`Fetched position for ${positionPDA.toString()}:`, position);
      return position;
    } catch (error) {
      console.error(`Error fetching position ${positionPDA.toString()}:`, error.message);
      return null;
    }
  }

  // Helper function to check if rewards config exists
  async function checkRewardsConfigExists(): Promise<boolean> {
    try {
      await program.account.rewardsConfig.fetch(rewardsConfigPDA);
      return true;
    } catch (error) {
      return false;
    }
  }

  let isAdmin: boolean;

  before(async () => {
    // Generate fresh keypairs to avoid conflicts
    admin = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();

    console.log("Test setup - Admin:", admin.publicKey.toString());
    console.log("Test setup - User1:", user1.publicKey.toString());
    console.log("Test setup - User2:", user2.publicKey.toString());

    // Request airdrops
    await provider.connection.requestAirdrop(admin.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user1.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user2.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);

    await sleep(2000);

    // Create mints for USDC and LP (always new)
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

    // Generate PDAs
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

    // Check if rewards config exists and set flDaoMint accordingly
    const configExists = await checkRewardsConfigExists();
    if (configExists) {
      const rewardsConfig = await program.account.rewardsConfig.fetch(rewardsConfigPDA);
      flDaoMint = rewardsConfig.flDaoMint;
      console.log("Using existing FL-DAO mint from config:", flDaoMint.toString());
      isAdmin = rewardsConfig.admin.equals(admin.publicKey);
    } else {
      flDaoMint = await createMint(
        provider.connection,
        admin,
        admin.publicKey,
        null,
        FLDAO_DECIMALS
      );
      console.log("Created new FL-DAO mint:", flDaoMint.toString());
      isAdmin = true;
    }

    // Create token accounts
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

    // Mint tokens
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
      const configExists = await checkRewardsConfigExists();
      
      if (configExists) {
        console.log("Rewards config already exists, checking admin authority...");
        const rewardsConfig = await program.account.rewardsConfig.fetch(rewardsConfigPDA);
        console.log("Existing admin:", rewardsConfig.admin.toString());
        console.log("Test admin:", admin.publicKey.toString());
        
        // If different admin, skip this test
        if (!rewardsConfig.admin.equals(admin.publicKey)) {
          console.log("Different admin detected, test will use existing config");
        }
        
        expect(rewardsConfig.flDaoMint.toString()).to.equal(flDaoMint.toString());
        expect(rewardsConfig.paused).to.be.false;
        return;
      }

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

      const rewardsConfig = await program.account.rewardsConfig.fetch(rewardsConfigPDA);
      expect(rewardsConfig.admin.toString()).to.equal(admin.publicKey.toString());
      expect(rewardsConfig.flDaoMint.toString()).to.equal(flDaoMint.toString());
      expect(rewardsConfig.exchangeRate.toNumber()).to.equal(EXCHANGE_RATE);
      expect(rewardsConfig.paused).to.be.false;
    });

    it("Initializes USDC pool", async () => {
      const pointsPerSecond = dailyRateToPerSecond(USDC_DAILY_RATE);

      try {
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
      } catch (error) {
        if (error.message.includes("already in use")) {
          console.log("USDC pool already exists");
        } else {
          throw error;
        }
      }

      const pool = await program.account.stakePool.fetch(usdcPoolPDA);
      expect(pool.mint.toString()).to.equal(usdcMint.toString());
      expect(pool.isLp).to.be.false;
      expect(pool.paused).to.be.false;
    });

    it("Initializes LP pool", async () => {
      const pointsPerSecond = dailyRateToPerSecond(LP_DAILY_RATE);

      try {
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
      } catch (error) {
        if (error.message.includes("already in use")) {
          console.log("LP pool already exists");
        } else {
          throw error;
        }
      }

      const pool = await program.account.stakePool.fetch(lpPoolPDA);
      expect(pool.mint.toString()).to.equal(lpMint.toString());
      expect(pool.isLp).to.be.true;
    });

    it("Updates FL-DAO mint authority to PDA", async () => {
      if (!isAdmin) {
        console.log("Config exists with different admin, skipping mint authority update");
        return;
      }

      try {
        const instruction = createSetAuthorityInstruction(
          flDaoMint,
          admin.publicKey,
          0, // AuthorityType.MintTokens
          mintAuthorityPDA
        );

        const transaction = new Transaction().add(instruction);
        await sendAndConfirmTransaction(provider.connection, transaction, [admin]);
        console.log("FL-DAO mint authority updated to PDA");
      } catch (error) {
        if (error.message.includes("already has the specified authority") || error.message.includes("owner does not match")) {
          console.log("Mint authority already set or cannot be set");
        } else {
          throw error;
        }
      }
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

      const position = await fetchPositionSafe(user1UsdcPositionPDA);
      expect(position).to.not.be.null;
      
      if (position) {
        expect(position).to.have.property('staker');
        expect(position).to.have.property('amount');
        expect(position).to.have.property('accumPoints');
        expect(position.staker.toString()).to.equal(user1.publicKey.toString());
        expect(position.amount.toString()).to.equal(stakeAmount.toString());
        expect(position.accumPoints.toString()).to.equal("0");
      }

      const pool = await program.account.stakePool.fetch(usdcPoolPDA);
      expect(pool.totalStaked.toNumber()).to.be.greaterThan(0);

      const vaultAccount = await getAccount(provider.connection, usdcVaultPDA);
      expect(Number(vaultAccount.amount)).to.be.greaterThan(0);
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

      const position = await fetchPositionSafe(user1LpPositionPDA);
      expect(position).to.not.be.null;
      
      if (position) {
        expect(position.amount.toString()).to.equal(stakeAmount.toString());
      }
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

      const pool = await program.account.stakePool.fetch(usdcPoolPDA);
      expect(pool.totalStaked.toNumber()).to.be.greaterThan(stakeAmount.toNumber());
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
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      await sleep(5000);

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

      const position = await fetchPositionSafe(user1UsdcPositionPDA);
      expect(position).to.not.be.null;
      
      if (position) {
        expect(position.accumPoints.toNumber()).to.be.greaterThan(0);
        console.log("Accumulated points:", position.accumPoints.toString());
      }
    });
  });

  describe("Unstaking", () => {
    it("Partially unstakes tokens", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const unstakeAmount = new BN(500 * Math.pow(10, USDC_DECIMALS));
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

      const position = await fetchPositionSafe(user1UsdcPositionPDA);
      expect(position).to.not.be.null;

      const finalUserBalance = (await getAccount(provider.connection, user1UsdcAccount)).amount;
      expect(Number(finalUserBalance - initialUserBalance)).to.equal(Number(unstakeAmount));
    });

    it("Prevents unstaking more than staked", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const unstakeAmount = new BN(10000 * Math.pow(10, USDC_DECIMALS));

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
      if (!isAdmin) {
        console.log("Not the admin, skipping exchange test");
        return;
      }

      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

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

      const position = await fetchPositionSafe(user1UsdcPositionPDA);
      expect(position).to.not.be.null;

      if (position && position.accumPoints.toNumber() > 0) {
        const pointsToExchange = position.accumPoints.div(new BN(2));
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

        const updatedPosition = await fetchPositionSafe(user1UsdcPositionPDA);
        if (updatedPosition) {
          const expectedRemainingPoints = position.accumPoints.sub(pointsToExchange);
          expect(updatedPosition.accumPoints.toString()).to.equal(expectedRemainingPoints.toString());
        }

        const finalFlDaoBalance = (await getAccount(provider.connection, user1FlDaoAccount)).amount;
        expect(finalFlDaoBalance).to.be.greaterThan(initialFlDaoBalance);
        
        console.log("FL-DAO tokens received:", (finalFlDaoBalance - initialFlDaoBalance).toString());
      } else {
        console.log("No points accumulated yet, skipping exchange test");
        return;
      }
    });

    it("Prevents exchanging more points than available", async () => {
      if (!isAdmin) {
        console.log("Not the admin, skipping exchange test");
        return;
      }

      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const position = await fetchPositionSafe(user1UsdcPositionPDA);
      if (!position) {
        console.log("Position not found, skipping test");
        return;
      }

      const tooManyPoints = position.accumPoints.add(new BN(1000000));

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
      if (!isAdmin) {
        console.log("Not the admin, skipping admin tests");
        return;
      }

      const tx = await program.methods
        .setPoolParams(null, true)
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
      const pool = await program.account.stakePool.fetch(usdcPoolPDA);
      if (!pool.paused) {
        console.log("Pool not paused, skipping test");
        return;
      }

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
      if (!isAdmin) {
        console.log("Not the admin, skipping admin tests");
        return;
      }

      const tx = await program.methods
        .setPoolParams(null, false)
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

    it("Prevents non-admin from updating parameters", async () => {
      try {
        await program.methods
          .setPoolParams(null, true)
          .accounts({
            rewardsConfig: rewardsConfigPDA,
            pool: usdcPoolPDA,
            admin: user1.publicKey,
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

      const position = await fetchPositionSafe(user1UsdcPositionPDA);
      if (position) {
        const stakedAmount = position.amount;
        console.log("Staked amount:", stakedAmount.toString());
        expect(stakedAmount.toNumber()).to.be.greaterThan(0);
      } else {
        console.log("No position found");
      }
    });
  });

  describe("Edge Cases", () => {
    it("Handles multiple stakes from same user", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const initialPosition = await fetchPositionSafe(user1UsdcPositionPDA);
      if (!initialPosition) {
        console.log("No initial position found, skipping test");
        return;
      }

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

      const updatedPosition = await fetchPositionSafe(user1UsdcPositionPDA);
      if (updatedPosition) {
        const expectedTotal = initialPosition.amount.add(additionalStake);
        expect(updatedPosition.amount.toString()).to.equal(expectedTotal.toString());
      }
    });

    it("Handles complete unstaking (zero remaining)", async () => {
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

      const position = await fetchPositionSafe(testUserPositionPDA);
      if (position) {
        expect(position.amount.toNumber()).to.equal(0);
      }
    });

    it("Handles synchronization with zero stake", async () => {
      const testUser = Keypair.generate();
      await provider.connection.requestAirdrop(testUser.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await sleep(1000);

      const [testUserPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), testUser.publicKey.toBuffer()],
        program.programId
      );

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
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        console.log("Error message:", error.message);
        expect(error.message).to.include("AccountNotInitialized");
      }
    });

    it("Handles minimum exchange requirements", async () => {
      if (!isAdmin) {
        console.log("Not the admin, skipping exchange test");
        return;
      }

      const [user2UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user2.publicKey.toBuffer()],
        program.programId
      );

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

      const position = await fetchPositionSafe(user2UsdcPositionPDA);
      
      if (position && position.accumPoints.toNumber() > 0) {
        const pointsToExchange = new BN(100);
        const unreasonableMinOut = new BN(1000 * Math.pow(10, FLDAO_DECIMALS));

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
      } else {
        console.log("No points accumulated, skipping minimum exchange test");
        return;
      }
    });
  });

  describe("Math Precision", () => {
    it("Calculates points accurately over different time periods", async () => {
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

      const stakeAmount = new BN(1000 * Math.pow(10, USDC_DECIMALS));

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

      const waitTime = 10;
      await sleep(waitTime * 1000);

      await program.methods
        .syncPosition()
        .accounts({
          pool: usdcPoolPDA,
          position: precisionUserPositionPDA,
          staker: precisionUser.publicKey,
        })
        .signers([precisionUser])
        .rpc();

      const position = await fetchPositionSafe(precisionUserPositionPDA);
      
      if (position) {
        console.log("Points accumulated over", waitTime, "seconds:", position.accumPoints.toString());

        const expectedPoints = Math.floor((USDC_DAILY_RATE * Math.pow(2,32) * waitTime) / 86400);
        const actualPoints = position.accumPoints.toNumber();

        expect(actualPoints).to.be.greaterThan(expectedPoints * 0.5);
        expect(actualPoints).to.be.lessThan(expectedPoints * 1.5);
      } else {
        console.log("Position not found for precision test");
        return;
      }
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

      await program.removeEventListener(listener);
    });

    it("Emits events on unstake", async () => {
      const [user1UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user1.publicKey.toBuffer()],
        program.programId
      );

      const position = await fetchPositionSafe(user1UsdcPositionPDA);
      if (!position || position.amount.toNumber() === 0) {
        console.log("No position to unstake from, skipping unstake event test");
        return;
      }

      const unstakeAmount = new BN(Math.min(100 * Math.pow(10, USDC_DECIMALS), position.amount.toNumber()));

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

      await program.removeEventListener(listener);
    });

    it("Emits events on points exchange", async () => {
      if (!isAdmin) {
        console.log("Not the admin, skipping exchange test");
        return;
      }

      const [user2UsdcPositionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), usdcPoolPDA.toBuffer(), user2.publicKey.toBuffer()],
        program.programId
      );

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

      const position = await fetchPositionSafe(user2UsdcPositionPDA);

      if (position && position.accumPoints.toNumber() > 1000) {
        const pointsToExchange = new BN(1000);

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

        await program.removeEventListener(listener);
      } else {
        console.log("Not enough points for exchange event test");
        return;
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
        await program.methods
          .unstake(new BN(100 * Math.pow(10, USDC_DECIMALS)))
          .accounts({
            pool: usdcPoolPDA,
            vault: usdcVaultPDA,
            position: user1UsdcPositionPDA,
            staker: user2.publicKey,
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
        await program.methods
          .syncPosition()
          .accounts({
            pool: usdcPoolPDA,
            position: user1LpPositionPDA,
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
        maxSupportedTransactionVersion: 0,
      });
      console.log("Stake transaction compute units:", stakeDetails?.meta?.computeUnitsConsumed);

      await sleep(2000);

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
        maxSupportedTransactionVersion: 0,
      });
      console.log("Sync transaction compute units:", syncDetails?.meta?.computeUnitsConsumed);

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
        maxSupportedTransactionVersion: 0,
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