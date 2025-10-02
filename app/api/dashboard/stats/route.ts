import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Freelancer, Client } from '@/models/User';
import { Job } from '@/models/Job';
import { Proposal } from '@/models/Proposal';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;
    
    // Check if user is freelancer or client
    const freelancer = await Freelancer.findById(userId);
    const client = await Client.findById(userId);
    
    if (!freelancer && !client) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    let stats = {};
    
    if (freelancer) {
      // Freelancer stats
      const acceptedProposals = await Proposal.find({ 
        freelancer: userId, 
        status: 'accepted' 
      }).populate('job');
      
      const activeJobs = await Job.find({ 
        freelancer: userId, 
        status: 'in_progress' 
      });
      
      const completedJobs = await Job.find({ 
        freelancer: userId, 
        status: 'completed' 
      });
      
      const totalEarnings = completedJobs.reduce((sum, job) => {
        return sum + (job.budget?.amount || 0);
      }, 0);
      
      const pendingProposals = await Proposal.countDocuments({ 
        freelancer: userId, 
        status: 'pending' 
      });
      
      stats = {
        totalEarnings,
        activeJobs: activeJobs.length,
        completedJobs: completedJobs.length,
        successRate: freelancer.successRate || 0,
        responseTime: freelancer.responseTime || '24 hours',
        pendingProposals,
        rating: freelancer.rating || 0,
        reviewCount: freelancer.reviewCount || 0,
      };
    } else if (client) {
      // Client stats
      const postedJobs = await Job.find({ client: userId });
      const activeJobs = await Job.find({ 
        client: userId, 
        status: 'in_progress' 
      });
      const completedJobs = await Job.find({ 
        client: userId, 
        status: 'completed' 
      });
      
      const totalSpent = completedJobs.reduce((sum, job) => {
        return sum + (job.budget?.amount || 0);
      }, 0);
      
      stats = {
        totalSpent,
        postedJobs: postedJobs.length,
        activeJobs: activeJobs.length,
        completedJobs: completedJobs.length,
        rating: client.rating || 0,
        reviewCount: client.reviewCount || 0,
      };
    }
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Dashboard Stats API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}