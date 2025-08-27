import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Freelancer, Client, Admin } from '@/models/User';
import { Job } from '@/models/Job';
import { Proposal } from '@/models/Proposal';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Verify admin exists
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 }
      );
    }
    
    // Get current date for time-based calculations
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate total users
    const totalFreelancers = await Freelancer.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalUsers = totalFreelancers + totalClients;
    
    // Calculate users growth
    const usersLastMonth = await Freelancer.countDocuments({ createdAt: { $gte: lastMonth } }) +
                          await Client.countDocuments({ createdAt: { $gte: lastMonth } });
    const usersGrowthRate = totalUsers > 0 ? ((usersLastMonth / totalUsers) * 100).toFixed(1) : '0.0';
    
    // Calculate active jobs
    const activeJobs = await Job.countDocuments({ status: 'in_progress' });
    const openJobs = await Job.countDocuments({ status: 'open' });
    const totalActiveJobs = activeJobs + openJobs;
    
    // Calculate completed jobs this week
    const completedJobsThisWeek = await Job.countDocuments({
      status: 'completed',
      updatedAt: { $gte: thisWeek }
    });
    
    // Calculate platform TVL (Total Value Locked)
    const completedJobs = await Job.find({ status: 'completed' }).select('budget');
    const inProgressJobs = await Job.find({ status: 'in_progress' }).select('budget');
    
    const completedValue = completedJobs.reduce((sum, job) => sum + (job.budget?.amount || 0), 0);
    const lockedValue = inProgressJobs.reduce((sum, job) => sum + (job.budget?.amount || 0), 0);
    const totalTVL = completedValue + lockedValue;
    
    // Calculate TVL growth (comparing with last month)
    const lastMonthCompletedJobs = await Job.find({
      status: 'completed',
      updatedAt: { $gte: lastMonth, $lt: now }
    }).select('budget');
    const lastMonthValue = lastMonthCompletedJobs.reduce((sum, job) => sum + (job.budget?.amount || 0), 0);
    const tvlGrowthRate = lastMonthValue > 0 ? (((totalTVL - lastMonthValue) / lastMonthValue) * 100).toFixed(1) : '0.0';
    
    // Calculate active disputes (assuming disputes are jobs with specific flags or status)
    // For now, we'll simulate this as jobs that might have issues
    const potentialDisputes = await Job.countDocuments({
      status: 'in_progress',
      updatedAt: { $lt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) } // Jobs in progress for more than 2 weeks
    });
    
    // Calculate disputes resolved today (simulated)
    const disputesResolvedToday = await Job.countDocuments({
      status: 'completed',
      updatedAt: { $gte: today }
    });
    
    // Format TVL for display
    const formatTVL = (amount: number) => {
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M HBAR`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K HBAR`;
      } else {
        return `${amount.toFixed(0)} HBAR`;
      }
    };
    
    const stats = {
      totalUsers: {
        value: totalUsers,
        growth: `+${usersGrowthRate}% from last month`,
        isPositive: parseFloat(usersGrowthRate) > 0
      },
      activeJobs: {
        value: totalActiveJobs,
        subtitle: `${completedJobsThisWeek} completed this week`
      },
      platformTVL: {
        value: formatTVL(totalTVL),
        growth: `+${tvlGrowthRate}% from last month`,
        isPositive: parseFloat(tvlGrowthRate) > 0
      },
      activeDisputes: {
        value: potentialDisputes,
        subtitle: `${disputesResolvedToday} resolved today`
      }
    };
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Admin Stats API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}