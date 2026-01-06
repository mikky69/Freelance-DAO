const { expect } = require("chai");
const hardhat = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = hardhat;

describe("FreelanceDAODisputeV2", function () {
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
      const { dispute, owner } = await loadFixture(deployContractsFixture);
      expect(await dispute.owner()).to.equal(owner.address);
    });

    it("Should set the right quorum", async function () {
      const { dispute } = await loadFixture(deployContractsFixture);
      expect(await dispute.quorum()).to.equal(2);
    });

    it("Should set dispute creation fee", async function () {
      const { dispute } = await loadFixture(deployContractsFixture);
      expect(await dispute.disputeCreationFee()).to.equal(ethers.parseEther("2"));
    });

    it("Should link escrow contract", async function () {
      const { dispute, escrow } = await loadFixture(deployContractsFixture);
      expect(await dispute.escrowContract()).to.equal(await escrow.getAddress());
    });
  });

  describe("DAO Member Management", function () {
    it("Should add DAO member", async function () {
      const { dispute, daoMember1 } = await loadFixture(deployContractsFixture);
      expect(await dispute.daoMembers(daoMember1.address)).to.equal(true);
    });

    it("Should remove DAO member", async function () {
      const { dispute, owner, daoMember1 } = await loadFixture(deployContractsFixture);
      
      await expect(dispute.connect(owner).removeDaoMember(daoMember1.address))
        .to.emit(dispute, "DaoMemberRemoved")
        .withArgs(daoMember1.address);

      expect(await dispute.daoMembers(daoMember1.address)).to.equal(false);
    });

    it("Should not allow non-owner to add DAO member", async function () {
      const { dispute, client, freelancer } = await loadFixture(deployContractsFixture);
      
      await expect(
        dispute.connect(client).addDaoMember(freelancer.address)
      ).to.be.reverted;
    });
  });

  describe("Dispute Creation", function () {
    it("Should create a dispute with fee", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(deployContractsFixture);

      // Create a job first
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

      // Create dispute
      await expect(
        dispute.connect(client).createDispute(
          1, // jobId
          freelancer.address,
          "Quality Issue",
          ethers.parseEther("10"),
          "Quality",
          "Work quality not acceptable",
          2, // QUALITY_ISSUE
          { value: ethers.parseEther("2") }
        )
      ).to.emit(dispute, "DisputeCreated");

      const disputeData = await dispute.getDispute(1);
      expect(disputeData.client).to.equal(client.address);
      expect(disputeData.freelancer).to.equal(freelancer.address);
      expect(disputeData.reason).to.equal(2); // QUALITY_ISSUE
    });

    it("Should reject dispute creation with insufficient fee", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(deployContractsFixture);

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

      await expect(
        dispute.connect(client).createDispute(
          1,
          freelancer.address,
          "Test",
          ethers.parseEther("10"),
          "Test",
          "Test",
          2,
          { value: ethers.parseEther("1") } // Only 1 HBAR instead of 2
        )
      ).to.be.revertedWith("Insufficient dispute fee");
    });

    it("Should notify escrow contract of dispute creation", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(deployContractsFixture);

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

      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Quality Issue",
        ethers.parseEther("10"),
        "Quality",
        "Not good",
        2, // QUALITY_ISSUE
        { value: ethers.parseEther("2") }
      );

      const job = await escrow.getJob(1);
      expect(job.status).to.equal(4); // DISPUTED
    });
  });

  describe("DAO Voting", function () {
    it("Should allow DAO members to vote", async function () {
      const { escrow, dispute, client, freelancer, daoMember1 } = await loadFixture(deployContractsFixture);

      // Create job and dispute
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

      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Quality Issue",
        ethers.parseEther("10"),
        "Quality",
        "Not good",
        2, // QUALITY_ISSUE
        { value: ethers.parseEther("2") }
      );

      await expect(
        dispute.connect(daoMember1).voteOnDispute(1, true) // Vote for client
      ).to.emit(dispute, "VoteCast").withArgs(1, daoMember1.address, "CLIENT");

      expect(await dispute.disputeVotes(1, daoMember1.address)).to.equal(true);
    });

    it("Should not allow non-DAO members to vote", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(deployContractsFixture);

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

      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Quality Issue",
        ethers.parseEther("10"),
        "Quality",
        "Not good",
        2,
        { value: ethers.parseEther("2") }
      );

      await expect(
        dispute.connect(client).voteOnDispute(1, true)
      ).to.be.revertedWith("Only DAO members can vote");
    });

    it("Should not allow double voting", async function () {
      const { escrow, dispute, client, freelancer, daoMember1 } = await loadFixture(deployContractsFixture);

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

      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Quality Issue",
        ethers.parseEther("10"),
        "Quality",
        "Not good",
        2,
        { value: ethers.parseEther("2") }
      );

      await dispute.connect(daoMember1).voteOnDispute(1, true);

      await expect(
        dispute.connect(daoMember1).voteOnDispute(1, false)
      ).to.be.revertedWith("Already voted");
    });

    it("Should auto-resolve dispute when quorum reached", async function () {
      const { escrow, dispute, client, freelancer, daoMember1, daoMember2 } = await loadFixture(deployContractsFixture);

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

      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Quality Issue",
        ethers.parseEther("10"),
        "Quality",
        "Not good",
        2,
        { value: ethers.parseEther("2") }
      );

      // First vote
      await dispute.connect(daoMember1).voteOnDispute(1, true); // For client

      // Second vote - should trigger resolution
      await expect(
        dispute.connect(daoMember2).voteOnDispute(1, true) // For client
      ).to.emit(dispute, "DisputeResolved");

      const disputeData = await dispute.getDispute(1);
      expect(disputeData.status).to.equal(1); // RESOLVED
      expect(disputeData.winner).to.equal(client.address);
    });

    it("Should reject dispute on a tie vote", async function () {
      const { escrow, dispute, client, freelancer, daoMember1, daoMember2 } = await loadFixture(deployContractsFixture);

      // Create job and dispute
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job", jobCategory: "Test", projectDescription: "Test",
        requiredSkills: ["Test"], projectDuration: "1 week", minimumBudget: ethers.parseEther("10"),
        maximumBudget: ethers.parseEther("10"), deadline: deadline
      };
      await escrow.connect(client).createFixedJob(jobParams, { value: ethers.parseEther("10") });
      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);
      await dispute.connect(client).createDispute(1, freelancer.address, "Quality Issue", ethers.parseEther("10"), "Quality", "Not good", 2, { value: ethers.parseEther("2") });

      // Create a tie vote
      await dispute.connect(daoMember1).voteOnDispute(1, true); // For client
      await dispute.connect(daoMember2).voteOnDispute(1, false); // For freelancer

      const disputeData = await dispute.getDispute(1);
      expect(disputeData.status).to.equal(2); // REJECTED
      expect(disputeData.winner).to.equal(ethers.ZeroAddress);
    });

    it("Should prevent voting on a dispute that doesn't require a vote", async function () {
      const { escrow, dispute, client, freelancer, daoMember1 } = await loadFixture(deployContractsFixture);

      // Create job and late delivery dispute
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job", jobCategory: "Test", projectDescription: "Test",
        requiredSkills: ["Test"], projectDuration: "1 week", minimumBudget: ethers.parseEther("10"),
        maximumBudget: ethers.parseEther("10"), deadline: deadline
      };
      await escrow.connect(client).createFixedJob(jobParams, { value: ethers.parseEther("10") });
      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);
      await dispute.connect(client).createDispute(1, freelancer.address, "Late Delivery", ethers.parseEther("10"), "Delivery", "Work was late", 0, { value: ethers.parseEther("2") });

      await expect(dispute.connect(daoMember1).voteOnDispute(1, true)).to.be.revertedWith("This dispute type doesn't require DAO vote");
    });
  });

  describe("Late Delivery Auto-Resolution", function () {
    it("Should auto-resolve late delivery disputes", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(deployContractsFixture);

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

      // Create late delivery dispute
      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Late Delivery",
        ethers.parseEther("10"),
        "Delivery",
        "Work was late",
        0, // LATE_DELIVERY
        { value: ethers.parseEther("2") }
      );

      // Auto-resolve (anyone can call)
      await expect(
        dispute.autoResolveDispute(1)
      ).to.emit(dispute, "DisputeResolved");

      const disputeData = await dispute.getDispute(1);
      expect(disputeData.status).to.equal(1); // RESOLVED
    });

    it("Should reject auto-resolution for a dispute that requires a vote", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(deployContractsFixture);

      // Create job and quality issue dispute
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job", jobCategory: "Test", projectDescription: "Test",
        requiredSkills: ["Test"], projectDuration: "1 week", minimumBudget: ethers.parseEther("10"),
        maximumBudget: ethers.parseEther("10"), deadline: deadline
      };
      await escrow.connect(client).createFixedJob(jobParams, { value: ethers.parseEther("10") });
      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);
      await dispute.connect(client).createDispute(
        1, freelancer.address, "Quality Issue", ethers.parseEther("10"),
        "Quality", "Bad work", 2, { value: ethers.parseEther("2") }
      );

      // Attempt to auto-resolve
      await expect(dispute.autoResolveDispute(1)).to.be.revertedWith("Requires DAO vote");
    });
  });

  describe("View Functions", function () {
    it("Should get all disputes", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(deployContractsFixture);

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

      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Test",
        ethers.parseEther("10"),
        "Test",
        "Test",
        2,
        { value: ethers.parseEther("2") }
      );

      const disputes = await dispute.getAllDisputes();
      expect(disputes.length).to.equal(1);
    });

    it("Should get user disputes", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(deployContractsFixture);

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

      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Test",
        ethers.parseEther("10"),
        "Test",
        "Test",
        2,
        { value: ethers.parseEther("2") }
      );

      const clientDisputes = await dispute.getUserDisputes(client.address);
      expect(clientDisputes.length).to.equal(1);

      const freelancerDisputes = await dispute.getUserDisputes(freelancer.address);
      expect(freelancerDisputes.length).to.equal(1);
    });

    it("Should get disputes by reason", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(deployContractsFixture);

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

      // Create quality issue dispute
      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Quality",
        ethers.parseEther("10"),
        "Quality",
        "Quality issue",
        2, // QUALITY_ISSUE
        { value: ethers.parseEther("2") }
      );

      const qualityDisputes = await dispute.getDisputesByReason(2); // QUALITY_ISSUE
      expect(qualityDisputes.length).to.equal(1);
    });

    it("Should get open disputes", async function () {
      const { escrow, dispute, client, freelancer } = await loadFixture(deployContractsFixture);

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

      await dispute.connect(client).createDispute(
        1,
        freelancer.address,
        "Test",
        ethers.parseEther("10"),
        "Test",
        "Test",
        2,
        { value: ethers.parseEther("2") }
      );

      const openDisputes = await dispute.getOpenDisputes();
      expect(openDisputes.length).to.equal(1);
    });
  });

  describe("Admin Functions", function () {
    it("Should update quorum", async function () {
      const { dispute, owner } = await loadFixture(deployContractsFixture);

      await expect(dispute.connect(owner).setQuorum(5))
        .to.emit(dispute, "QuorumUpdated")
        .withArgs(2, 5);

      expect(await dispute.quorum()).to.equal(5);
    });

    it("Should update dispute fee", async function () {
      const { dispute, owner } = await loadFixture(deployContractsFixture);

      const newFee = ethers.parseEther("3");
      await expect(dispute.connect(owner).setDisputeCreationFee(newFee))
        .to.emit(dispute, "DisputeFeeUpdated");

      expect(await dispute.disputeCreationFee()).to.equal(newFee);
    });

    it("Should reject updates from non-owner", async function () {
      const { dispute, client } = await loadFixture(deployContractsFixture);

      await expect(dispute.connect(client).setQuorum(5)).to.be.reverted;
      await expect(dispute.connect(client).setDisputeCreationFee(ethers.parseEther("5"))).to.be.reverted;
      await expect(dispute.connect(client).setEscrowContract(client.address)).to.be.reverted;
    });

    it("Should transfer dispute fee to treasury", async function () {
      const { escrow, dispute, client, freelancer, treasury } = await loadFixture(deployContractsFixture);
      const fee = ethers.parseEther("2");

      // A job must exist before a dispute can be created for it.
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 7;
      const jobParams = {
        jobTitle: "Test Job", jobCategory: "Test", projectDescription: "Test",
        requiredSkills: ["Test"], projectDuration: "1 week", minimumBudget: ethers.parseEther("10"),
        maximumBudget: ethers.parseEther("10"), deadline: deadline
      };
      await escrow.connect(client).createFixedJob(jobParams, { value: ethers.parseEther("10") });
      await escrow.connect(freelancer).requestJob(1);
      await escrow.connect(client).approveProvider(1, freelancer.address);

      await expect(dispute.connect(client).createDispute(1, freelancer.address, "Test", 1, "Test", "Test", 2, { value: fee })).to.changeEtherBalance(treasury, fee);
    });
  });
});
