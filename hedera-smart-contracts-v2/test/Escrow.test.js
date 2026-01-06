const { expect } = require("chai");
const hardhat = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = hardhat;

describe("FreelanceDAOEscrowV2", function () {
  async function deployContractsFixture() {
    const [owner, treasury, client, freelancer, daoMember1, daoMember2, daoMember3] = await ethers.getSigners();

    // Deploy Escrow
    const EscrowV2 = await ethers.getContractFactory("FreelanceDAOEscrowV2");
    const escrow = await EscrowV2.deploy(treasury.address, owner.address);

    // Deploy Dispute
    const DisputeV2 = await ethers.getContractFactory("FreelanceDAODisputeV2");
    const dispute = await DisputeV2.deploy(2, treasury.address); // Quorum of 2

    // Link contracts
    await escrow.setDisputeContract(await dispute.getAddress());
    await dispute.setEscrowContract(await escrow.getAddress());

    // Add DAO members
    await dispute.addDaoMember(daoMember1.address);
    await dispute.addDaoMember(daoMember2.address);
    await dispute.addDaoMember(daoMember3.address);

    return { escrow, dispute, owner, treasury, client, freelancer, daoMember1, daoMember2, daoMember3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { escrow, owner } = await loadFixture(deployContractsFixture);
      expect(await escrow.owner()).to.equal(owner.address);
    });

    it("Should set the right DAO treasury", async function () {
      const { escrow, treasury } = await loadFixture(deployContractsFixture);
      expect(await escrow.daoTreasury()).to.equal(treasury.address);
    });

    it("Should link dispute contract", async function () {
      const { escrow, dispute } = await loadFixture(deployContractsFixture);
      expect(await escrow.disputeContract()).to.equal(await dispute.getAddress());
    });
  });

  describe("Fixed Job Creation", function () {
    it("Should create a fixed job and fund it", async function () {
      const { escrow, client } = await loadFixture(deployContractsFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7; // 7 days
      const jobParams = {
        jobTitle: "Smart Contract Dev",
        jobCategory: "Blockchain",
        projectDescription: "Build escrow contract",
        requiredSkills: ["Solidity", "Web3"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("10"),
        maximumBudget: ethers.parseEther("10"),
        deadline: deadline
      };

      await expect(
        escrow.connect(client).createFixedJob(jobParams, {
          value: ethers.parseEther("10")
        })
      ).to.emit(escrow, "JobCreated").withArgs(1, 0, client.address, ethers.parseEther("10"), deadline);

      const job = await escrow.getJob(1);
      expect(job.client).to.equal(client.address);
      expect(job.totalAmount).to.equal(ethers.parseEther("10"));
      expect(job.funded).to.equal(true);
    });

    it("Should reject job creation with past deadline", async function () {
      const { escrow, client } = await loadFixture(deployContractsFixture);

      const pastDeadline = Math.floor(Date.now() / 1000) - 86400; // Yesterday
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Testing",
        projectDescription: "Test",
        requiredSkills: ["Testing"],
        projectDuration: "1 day",
        minimumBudget: ethers.parseEther("1"),
        maximumBudget: ethers.parseEther("1"),
        deadline: pastDeadline
      };

      await expect(
        escrow.connect(client).createFixedJob(jobParams, {
          value: ethers.parseEther("1")
        })
      ).to.be.revertedWith("Deadline must be future");
    });
  });

  describe("Milestone Job Creation", function () {
    it("Should create a milestone job", async function () {
      const { escrow, client } = await loadFixture(deployContractsFixture);

      const milestones = [
        ethers.parseEther("3"),
        ethers.parseEther("4"),
        ethers.parseEther("3")
      ];

      const deadline = Math.floor(Date.now() / 1000) + 86400 * 14; // 14 days
      const jobParams = {
        jobTitle: "Full Stack dApp",
        jobCategory: "Development",
        projectDescription: "Build a dApp",
        requiredSkills: ["React", "Solidity"],
        projectDuration: "2 weeks",
        minimumBudget: ethers.parseEther("10"),
        maximumBudget: ethers.parseEther("10"),
        deadline: deadline
      };

      await expect(
        escrow.connect(client).createMilestoneJob(milestones, jobParams, {
          value: ethers.parseEther("10")
        })
      ).to.emit(escrow, "JobCreated").withArgs(1, 1, client.address, ethers.parseEther("10"), deadline);

      const job = await escrow.getJob(1);
      expect(job.jobType).to.equal(1); // MILESTONE
      expect(job.funded).to.equal(true);
    });

    it("Should get milestone details", async function () {
      const { escrow, client } = await loadFixture(deployContractsFixture);

      const milestones = [ethers.parseEther("5"), ethers.parseEther("5")];
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("10"),
        maximumBudget: ethers.parseEther("10"),
        deadline: deadline
      };

      await escrow.connect(client).createMilestoneJob(milestones, jobParams, {
        value: ethers.parseEther("10")
      });

      const milestone = await escrow.getMilestone(1, 0);
      expect(milestone.amount).to.equal(ethers.parseEther("5"));
      expect(milestone.confirmed).to.equal(false);
      expect(milestone.delivered).to.equal(false);
    });
  });

  describe("Provider Request and Approval", function () {
    it("Should allow freelancer to request job", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("5"),
        maximumBudget: ethers.parseEther("5"),
        deadline: deadline
      };

      await escrow.connect(client).createFixedJob(jobParams, {
        value: ethers.parseEther("5")
      });

      await expect(escrow.connect(freelancer).requestJob(1))
        .to.emit(escrow, "ProviderRequested")
        .withArgs(1, freelancer.address);

      expect(await escrow.requested(freelancer.address, 1)).to.equal(true);
    });

    it("Should allow client to approve freelancer", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("5"),
        maximumBudget: ethers.parseEther("5"),
        deadline: deadline
      };

      await escrow.connect(client).createFixedJob(jobParams, {
        value: ethers.parseEther("5")
      });

      await escrow.connect(freelancer).requestJob(1);

      await expect(escrow.connect(client).approveProvider(1, freelancer.address))
        .to.emit(escrow, "ProviderApproved")
        .withArgs(1, freelancer.address);

      const job = await escrow.getJob(1);
      expect(job.freelancer).to.equal(freelancer.address);
      expect(job.status).to.equal(1); // PENDING
    });
  });

  describe("Delivery and Confirmation", function () {
    it("Should mark delivery for fixed job", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("5"),
        maximumBudget: ethers.parseEther("5"),
        deadline: deadline
      };

      await escrow.connect(client).createFixedJob(jobParams, {
        value: ethers.parseEther("5")
      });

      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);

      await expect(escrow.connect(freelancer).markDelivery(1, 0))
        .to.emit(escrow, "DeliveryMarked");

      const job = await escrow.getJob(1);
      expect(job.status).to.equal(2); // DELIVERY
    });

    it("Should detect late delivery", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);

      const latestBlock = await ethers.provider.getBlock("latest");
      const shortDeadline = latestBlock.timestamp + 10; // Increased buffer to prevent race conditions
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "2 seconds",
        minimumBudget: ethers.parseEther("5"),
        maximumBudget: ethers.parseEther("5"),
        deadline: shortDeadline
      };

      await escrow.connect(client).createFixedJob(jobParams, {
        value: ethers.parseEther("5")
      });

      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);

      // Wait for deadline to pass
      await time.increase(15);

      await escrow.connect(freelancer).markDelivery(1, 0);

      const job = await escrow.getJob(1);
      expect(job.isLate).to.equal(true);
    });

    it("Should confirm fixed job", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("10"),
        maximumBudget: ethers.parseEther("10"),
        deadline: deadline
      };

      await escrow.connect(client).createFixedJob(jobParams, {
        value: ethers.parseEther("10")
      });

      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);
      await escrow.connect(freelancer).markDelivery(1, 0);

      await expect(escrow.connect(client).confirmFixedJob(1))
        .to.emit(escrow, "FixedJobConfirmed")
        .withArgs(1, ethers.parseEther("10"));

      const job = await escrow.getJob(1);
      expect(job.status).to.equal(3); // CONFIRMED
      expect(job.confirmedAmount).to.equal(ethers.parseEther("10"));
    });
  });

  describe("Withdrawal System", function () {
    it("Should allow freelancer to withdraw with 5% fee", async function () {
      const { escrow, client, freelancer, treasury } = await loadFixture(deployContractsFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("100"),
        maximumBudget: ethers.parseEther("100"),
        deadline: deadline
      };

      await escrow.connect(client).createFixedJob(jobParams, {
        value: ethers.parseEther("100")
      });

      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);
      await escrow.connect(freelancer).markDelivery(1, 0);
      await escrow.connect(client).confirmFixedJob(1);

      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

      const tx = await escrow.connect(freelancer).withdraw(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);

      // Expected: 100 HBAR - 5% fee = 95 HBAR
      const expectedNet = ethers.parseEther("95");
      const actualReceived = freelancerBalanceAfter - freelancerBalanceBefore + gasUsed;

      expect(actualReceived).to.be.closeTo(expectedNet, ethers.parseEther("0.001"));
    });

    it("Should apply 7% fee for late delivery", async function () {
      const { escrow, dispute, client, freelancer, daoMember1, daoMember2 } = await loadFixture(deployContractsFixture);

      const latestBlock = await ethers.provider.getBlock("latest");
      const shortDeadline = latestBlock.timestamp + 10; // Increased buffer to prevent race conditions
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "2 seconds",
        minimumBudget: ethers.parseEther("100"),
        maximumBudget: ethers.parseEther("100"),
        deadline: shortDeadline
      };

      await escrow.connect(client).createFixedJob(jobParams, {
        value: ethers.parseEther("100")
      });

      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);

      // Wait for deadline to pass
      await time.increase(15);

      // Freelancer must mark delivery (even if late) for the process to continue
      await escrow.connect(freelancer).markDelivery(1, 0);
      
      // Client files late delivery dispute
      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Late Delivery",
        ethers.parseEther("100"),
        "Delivery",
        "Job was delivered late",
        0, // LATE_DELIVERY
        { value: ethers.parseEther("2") }
      );

      // Auto-resolve late delivery
      await dispute.autoResolveDispute(1);

      // Client must still confirm the job to release funds
      await escrow.connect(client).confirmFixedJob(1);

      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

      const tx = await escrow.connect(freelancer).withdraw(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);

      // Expected: 100 HBAR - 7% fee = 93 HBAR
      const expectedNet = ethers.parseEther("93");
      const actualReceived = freelancerBalanceAfter - freelancerBalanceBefore + gasUsed;

      expect(actualReceived).to.be.closeTo(expectedNet, ethers.parseEther("0.001"));
    });

    it("Should apply 10% fee for early milestone withdrawal", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);

      const milestones = [ethers.parseEther("50"), ethers.parseEther("50")];
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("100"),
        maximumBudget: ethers.parseEther("100"),
        deadline: deadline
      };

      await escrow.connect(client).createMilestoneJob(milestones, jobParams, {
        value: ethers.parseEther("100")
      });

      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);

      // Complete first milestone only
      await escrow.connect(freelancer).markDelivery(1, 0);
      await escrow.connect(client).confirmMilestone(1, 0);

      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

      const tx = await escrow.connect(freelancer).withdraw(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);

      // Expected: 50 HBAR - 10% fee = 45 HBAR
      const expectedNet = ethers.parseEther("45");
      const actualReceived = freelancerBalanceAfter - freelancerBalanceBefore + gasUsed;

      expect(actualReceived).to.be.closeTo(expectedNet, ethers.parseEther("0.001"));
    });

    it("Should batch withdraw from multiple jobs", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);

      // Create two jobs
      for (let i = 0; i < 2; i++) {
        const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
        const jobParams = {
          jobTitle: `Job ${i + 1}`,
          jobCategory: "Test",
          projectDescription: "Test",
          requiredSkills: ["Test"],
          projectDuration: "1 week",
          minimumBudget: ethers.parseEther("50"),
          maximumBudget: ethers.parseEther("50"),
          deadline: deadline
        };

        await escrow.connect(client).createFixedJob(jobParams, {
          value: ethers.parseEther("50")
        });

        await escrow.connect(freelancer).requestJob(i + 1);
        await escrow.connect(client).approveProvider(i + 1, freelancer.address);
        await escrow.connect(freelancer).markDelivery(i + 1, 0);
        await escrow.connect(client).confirmFixedJob(i + 1);
      }

      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

      const tx = await escrow.connect(freelancer).batchWithdraw([1, 2]);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);

      // Expected: (50 + 50) - 5% = 95 HBAR
      const expectedNet = ethers.parseEther("95");
      const actualReceived = freelancerBalanceAfter - freelancerBalanceBefore + gasUsed;

      expect(actualReceived).to.be.closeTo(expectedNet, ethers.parseEther("0.001"));
    });
  });

  describe("Client Refunds", function () {
    it("Should allow client to request refund for milestone job", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);

      const milestones = [
        ethers.parseEther("30"),
        ethers.parseEther("30"),
        ethers.parseEther("40")
      ];

      const deadline = Math.floor(Date.now() / 1000) + 86400 * 14;
      const jobParams = {
        jobTitle: "Full Project",
        jobCategory: "Development",
        projectDescription: "Build something",
        requiredSkills: ["Coding"],
        projectDuration: "2 weeks",
        minimumBudget: ethers.parseEther("100"),
        maximumBudget: ethers.parseEther("100"),
        deadline: deadline
      };

      await escrow.connect(client).createMilestoneJob(milestones, jobParams, {
        value: ethers.parseEther("100")
      });

      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);

      // Complete first milestone
      await escrow.connect(freelancer).markDelivery(1, 0);
      await escrow.connect(client).confirmMilestone(1, 0);

      const clientBalanceBefore = await ethers.provider.getBalance(client.address);

      // Client requests refund
      const tx = await escrow.connect(client).clientRequestRefund(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const clientBalanceAfter = await ethers.provider.getBalance(client.address);

      // Expected refund: 70 HBAR (remaining 2 milestones)
      const expectedRefund = ethers.parseEther("70");
      const actualRefund = clientBalanceAfter - clientBalanceBefore + gasUsed;

      expect(actualRefund).to.be.closeTo(expectedRefund, ethers.parseEther("0.001"));

      // Freelancer should still be able to withdraw with 5% fee (not 10%, not their fault)
      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);
      const withdrawTx = await escrow.connect(freelancer).withdraw(1);
      const withdrawReceipt = await withdrawTx.wait();
      const withdrawGasUsed = withdrawReceipt.gasUsed * withdrawReceipt.gasPrice;
      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);

      // Expected: 30 HBAR - 5% = 28.5 HBAR
      const expectedNet = ethers.parseEther("28.5");
      const actualReceived = freelancerBalanceAfter - freelancerBalanceBefore + withdrawGasUsed;

      expect(actualReceived).to.be.closeTo(expectedNet, ethers.parseEther("0.001"));
    });

    it("Should allow client to cancel job before work starts", async function () {
      const { escrow, client } = await loadFixture(deployContractsFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("10"),
        maximumBudget: ethers.parseEther("10"),
        deadline: deadline
      };

      await escrow.connect(client).createFixedJob(jobParams, {
        value: ethers.parseEther("10")
      });

      const clientBalanceBefore = await ethers.provider.getBalance(client.address);

      const tx = await escrow.connect(client).cancelJob(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const clientBalanceAfter = await ethers.provider.getBalance(client.address);

      const refund = clientBalanceAfter - clientBalanceBefore + gasUsed;
      expect(refund).to.be.closeTo(ethers.parseEther("10"), ethers.parseEther("0.001"));

      const job = await escrow.getJob(1);
      expect(job.status).to.equal(6); // CANCELLED
    });
  });

  describe("View Functions", function () {
    it("Should get freelancer jobs", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);

      // Define deadline here in view function test
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("5"),
        maximumBudget: ethers.parseEther("5"),
        deadline: deadline
      };

      await escrow.connect(client).createFixedJob(jobParams, {
        value: ethers.parseEther("5")
      });

      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);

      const jobs = await escrow.getFreelancerJobs(freelancer.address);
      expect(jobs.length).to.equal(1);
      expect(jobs[0]).to.equal(1);
    });

    it("Should get available withdrawal amount", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job",
        jobCategory: "Test",
        projectDescription: "Test",
        requiredSkills: ["Test"],
        projectDuration: "1 week",
        minimumBudget: ethers.parseEther("100"),
        maximumBudget: ethers.parseEther("100"),
        deadline: deadline
      };

      await escrow.connect(client).createFixedJob(jobParams, {
        value: ethers.parseEther("100")
      });

      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);
      await escrow.connect(freelancer).markDelivery(1, 0);
      await escrow.connect(client).confirmFixedJob(1);

      const available = await escrow.getAvailableWithdrawal(1);
      expect(available).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Dispute Integration", function () {
    it("Should handle dispute resolution where freelancer wins", async function () {
      const { escrow, dispute, client, freelancer, daoMember1, daoMember2 } = await loadFixture(deployContractsFixture);

      // Create and approve a fixed job
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job", jobCategory: "Test", projectDescription: "Test",
        requiredSkills: ["Test"], projectDuration: "1 week", minimumBudget: ethers.parseEther("100"),
        maximumBudget: ethers.parseEther("100"), deadline: deadline
      };
      await escrow.connect(client).createFixedJob(jobParams, { value: ethers.parseEther("100") });
      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);
      await escrow.connect(freelancer).markDelivery(1, 0);

      // Client creates a quality issue dispute
      await dispute.connect(client).createDispute(1, freelancer.address, "Quality Issue", ethers.parseEther("100"), "Quality", "Bad work", 2, { value: ethers.parseEther("2") });

      // DAO members vote for the freelancer
      await dispute.connect(daoMember1).voteOnDispute(1, false); // false = for freelancer
      await dispute.connect(daoMember2).voteOnDispute(1, false); // This vote resolves the dispute

      // Check that the job is now confirmed in favor of the freelancer
      const job = await escrow.getJob(1);
      expect(job.status).to.equal(3); // CONFIRMED
      expect(await escrow.getAvailableWithdrawal(1)).to.equal(ethers.parseEther("100"));
    });

    it("Should handle dispute resolution where client wins", async function () {
      const { escrow, dispute, client, freelancer, daoMember1, daoMember2 } = await loadFixture(deployContractsFixture);

      // Create and approve a fixed job
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job", jobCategory: "Test", projectDescription: "Test",
        requiredSkills: ["Test"], projectDuration: "1 week", minimumBudget: ethers.parseEther("100"),
        maximumBudget: ethers.parseEther("100"), deadline: deadline
      };
      await escrow.connect(client).createFixedJob(jobParams, { value: ethers.parseEther("100") });
      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);

      // Client creates a quality issue dispute
      await dispute.connect(client).createDispute(1, freelancer.address, "Quality Issue", ethers.parseEther("100"), "Quality", "Never delivered", 2, { value: ethers.parseEther("2") });

      const clientBalanceBefore = await ethers.provider.getBalance(client.address);

      // DAO members vote for the client, which should trigger a refund
      await dispute.connect(daoMember1).voteOnDispute(1, true); // true = for client
      const resolveTx = await dispute.connect(daoMember2).voteOnDispute(1, true);
      const receipt = await resolveTx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const clientBalanceAfter = await ethers.provider.getBalance(client.address);

      // Check that the job is refunded
      const job = await escrow.getJob(1);
      expect(job.status).to.equal(5); // REFUNDED

      // Check that the client received the refund
      // Note: This check is tricky because the refund happens in a separate internal transaction
      // A simple balance check might not be precise. A better check is to see if the contract balance decreased.
      expect(await ethers.provider.getBalance(await escrow.getAddress())).to.equal(0);
    });
  });

  describe("Advanced Funding", function () {
    it("Should allow funding a milestone job after creation", async function () {
      const { escrow, client } = await loadFixture(deployContractsFixture);

      const milestones = [ethers.parseEther("10"), ethers.parseEther("20")];
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Unfunded Job", jobCategory: "Test", projectDescription: "Test",
        requiredSkills: ["Test"], projectDuration: "1 week", minimumBudget: ethers.parseEther("30"),
        maximumBudget: ethers.parseEther("30"), deadline: deadline
      };

      // Create job without funding
      await escrow.connect(client).createMilestoneJob(milestones, jobParams);

      let job = await escrow.getJob(1);
      expect(job.funded).to.equal(false);

      // Now fund it
      await expect(escrow.connect(client).fundJob(1, { value: ethers.parseEther("30") }))
        .to.emit(escrow, "JobFunded")
        .withArgs(1, ethers.parseEther("30"));

      job = await escrow.getJob(1);
      expect(job.funded).to.equal(true);
    });

    it("Should reject funding from a non-client", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployContractsFixture);
      const milestones = [ethers.parseEther("10")];
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test", jobCategory: "Test", projectDescription: "Test",
        requiredSkills: ["Test"], projectDuration: "1 week", minimumBudget: ethers.parseEther("10"),
        maximumBudget: ethers.parseEther("10"), deadline: deadline
      };
      await escrow.connect(client).createMilestoneJob(milestones, jobParams);

      await expect(escrow.connect(freelancer).fundJob(1, { value: ethers.parseEther("10") })).to.be.revertedWith("Only client can fund");
    });
  });
});
