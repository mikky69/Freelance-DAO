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
    const freelancer = await Freelancer.findById(userId).select('-password');
    const client = await Client.findById(userId).select('-password');
    
    if (!freelancer && !client) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = freelancer || client;
    const userType = freelancer ? 'freelancer' : 'client';
    
    // Get additional stats
    let stats = {};
    let jobHistory = [];
    let reviews = [];
    
    if (freelancer) {
      // Freelancer stats
      const completedJobs = await Job.find({ 
        freelancer: userId, 
        status: 'completed' 
      }).populate('client', 'fullname avatar');
      
      const totalEarnings = completedJobs.reduce((sum, job) => {
        return sum + (job.budget?.amount || 0);
      }, 0);
      
      const proposals = await Proposal.find({ freelancer: userId });
      const acceptedProposals = proposals.filter(p => p.status === 'accepted');
      
      stats = {
        totalEarnings,
        completedJobs: completedJobs.length,
        totalProposals: proposals.length,
        acceptanceRate: proposals.length > 0 ? (acceptedProposals.length / proposals.length) * 100 : 0,
      };
      
      // Job history
      jobHistory = completedJobs.map(job => ({
        id: job._id,
        title: job.title,
        client: job.client,
        amount: job.budget?.amount,
        currency: job.budget?.currency,
        status: job.status,
        completedAt: job.updatedAt,
      }));
      
      // Remove mock reviews - return empty array for now
      // TODO: Create a Review model and fetch real reviews from database
      reviews = [];
    } else if (client) {
      // Client stats
      const postedJobs = await Job.find({ client: userId });
      const completedJobs = postedJobs.filter(job => job.status === 'completed');
      
      const totalSpent = completedJobs.reduce((sum, job) => {
        return sum + (job.budget?.amount || 0);
      }, 0);
      
      stats = {
        totalSpent,
        postedJobs: postedJobs.length,
        completedJobs: completedJobs.length,
        activeJobs: postedJobs.filter(job => job.status === 'in_progress').length,
      };
      
      // Job history for clients
      jobHistory = postedJobs.map(job => ({
        id: job._id,
        title: job.title,
        freelancer: job.freelancer,
        amount: job.budget?.amount,
        currency: job.budget?.currency,
        status: job.status,
        postedAt: job.createdAt,
      }));
      
      // No reviews for clients
      reviews = [];
    }
    
    return NextResponse.json({
      user: {
        ...user.toObject(),
        userType,
      },
      stats,
      jobHistory,
      reviews,
    });
  } catch (error) {
    console.error('Profile API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    
    const updateData = await request.json();
    
    // Remove sensitive fields
    delete updateData.password;
    delete updateData._id;
    delete updateData.email;
    
    // Check if user is freelancer or client
    const freelancer = await Freelancer.findById(userId);
    const client = await Client.findById(userId);
    
    if (!freelancer && !client) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    let updatedUser;
    if (freelancer) {
      updatedUser = await Freelancer.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
    } else {
      updatedUser = await Client.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
    }
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile Update API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}