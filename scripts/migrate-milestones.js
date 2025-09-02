// Migration script to synchronize milestones between existing contracts and jobs
const mongoose = require('mongoose');
const path = require('path');

// Try to load dotenv if available, otherwise use process.env directly
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (error) {
  console.log('dotenv not available, using process.env directly');
}

// Import models
const { Contract } = require('../models/Contract');
const { Job } = require('../models/Job');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/freelancedao';

async function migrateMilestones() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all contracts with milestones
    const contracts = await Contract.find({
      milestones: { $exists: true, $ne: [] }
    }).populate('job');

    console.log(`Found ${contracts.length} contracts with milestones`);

    let syncedCount = 0;
    let errorCount = 0;

    for (const contract of contracts) {
      try {
        if (!contract.job) {
          console.log(`Skipping contract ${contract._id} - no associated job`);
          continue;
        }

        const job = await Job.findById(contract.job._id);
        if (!job) {
          console.log(`Skipping contract ${contract._id} - job not found`);
          continue;
        }

        // Check if job already has milestones
        if (job.milestones && job.milestones.length > 0) {
          console.log(`Job ${job._id} already has milestones, checking for sync...`);
          
          // Check if milestones are different
          let needsSync = false;
          if (job.milestones.length !== contract.milestones.length) {
            needsSync = true;
          } else {
            for (let i = 0; i < job.milestones.length; i++) {
              const jobMilestone = job.milestones[i];
              const contractMilestone = contract.milestones[i];
              
              if (jobMilestone.name !== contractMilestone.name ||
                  jobMilestone.amount !== contractMilestone.amount ||
                  jobMilestone.completed !== contractMilestone.completed) {
                needsSync = true;
                break;
              }
            }
          }

          if (!needsSync) {
            console.log(`Job ${job._id} milestones already in sync`);
            continue;
          }
        }

        // Sync contract milestones to job
        job.milestones = contract.milestones.map(milestone => ({
          name: milestone.name,
          amount: milestone.amount,
          duration: milestone.duration || '1 week',
          completed: milestone.completed || false,
          completedAt: milestone.completedAt
        }));

        // Calculate progress based on completed milestones
        const completedCount = job.milestones.filter(m => m.completed).length;
        job.progress = Math.round((completedCount / job.milestones.length) * 100);

        // Update job status if all milestones are completed
        if (completedCount === job.milestones.length && job.status !== 'completed') {
          job.status = 'completed';
        } else if (completedCount < job.milestones.length && job.status === 'completed') {
          job.status = 'in_progress';
        }

        await job.save();
        syncedCount++;
        
        console.log(`✓ Synced milestones for job ${job._id} (${job.milestones.length} milestones, ${job.progress}% complete)`);
        
      } catch (error) {
        console.error(`✗ Error syncing contract ${contract._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total contracts processed: ${contracts.length}`);
    console.log(`Successfully synced: ${syncedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Migration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateMilestones();
}

module.exports = { migrateMilestones };