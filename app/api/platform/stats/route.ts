import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Freelancer, Client } from '@/models/User';
import { Job } from '@/models/Job';
import { Proposal } from '@/models/Proposal';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get platform-wide statistics (no authentication required for public stats)
    
    // Count total clients (all users with client role)
    const totalClients = await Client.countDocuments();
    
    // Count total freelancers
    const totalFreelancers = await Freelancer.countDocuments({ verified: true });
    
    // Count total jobs (all statuses)
    const totalJobs = await Job.countDocuments();
    
    // Count active jobs (open and in progress)
    const activeJobs = await Job.countDocuments({ 
      status: { $in: ['open', 'in_progress'] } 
    });
    
    // Count completed jobs
    const completedJobs = await Job.countDocuments({ status: 'completed' });
    
    // Calculate total volume from completed jobs
    const completedJobsWithBudget = await Job.find({ 
      status: 'completed',
      'budget.amount': { $exists: true }
    }).select('budget');
    
    const totalVolume = completedJobsWithBudget.reduce((sum, job) => {
      return sum + (job.budget?.amount || 0);
    }, 0);
    
    // Count total proposals
    const totalProposals = await Proposal.countDocuments();
    
    // Calculate success rate (completed jobs / total jobs)
    const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
    
    const stats = {
      totalClients,
      totalFreelancers,
      totalJobs,
      activeJobs,
      completedJobs,
      totalVolume,
      totalProposals,
      successRate,
      totalUsers: totalClients + totalFreelancers
    };
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Platform Stats API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}