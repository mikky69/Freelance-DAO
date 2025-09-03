import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Contract } from '@/models/Contract';
import { Freelancer, Client } from '@/models/User';
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
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const progress = searchParams.get('progress');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Check if user is freelancer or client
    const freelancer = await Freelancer.findById(userId);
    const client = await Client.findById(userId);
    
    if (!freelancer && !client) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Build query based on user type
    const query: any = {};
    
    if (freelancer) {
      query.freelancer = userId;
    } else if (client) {
      query.client = userId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (progress) {
      query.progress = parseInt(progress);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch jobs
    let jobs = await Job.find(query)
      .populate('client', 'fullname avatar')
      .populate('freelancer', 'fullname avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // For freelancers, filter jobs to only show those with active contracts
    if (freelancer) {
      const jobIds = jobs.map(job => job._id);
      const activeContracts = await Contract.find({
        job: { $in: jobIds },
        freelancer: userId,
        status: 'active'
      }).select('job');
      
      const activeJobIds = activeContracts.map(contract => contract.job.toString());
      jobs = jobs.filter(job => activeJobIds.includes(job._id.toString()));
    }
    
    // Get total count for pagination
    const total = await Job.countDocuments(query);
    
    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Jobs API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}