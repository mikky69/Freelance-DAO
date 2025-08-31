import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Proposal } from '@/models/Proposal';
import { Job } from '@/models/Job';
import { Freelancer, Client } from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function POST(request: NextRequest) {
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
    
    // Verify user is a freelancer
    const freelancer = await Freelancer.findById(userId);
    if (!freelancer) {
      return NextResponse.json(
        { message: 'Only freelancers can submit proposals' },
        { status: 403 }
      );
    }
    
    const {
      jobId,
      title,
      description,
      budget,
      timeline,
      milestones
    } = await request.json();
    
    // Validate required fields
    if (!jobId || !title || !description || !budget || !timeline) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    if (job.status !== 'open') {
      return NextResponse.json(
        { message: 'Job is not accepting proposals' },
        { status: 400 }
      );
    }
    
    // Check if freelancer already submitted a proposal for this job
    const existingProposal = await Proposal.findOne({
      job: jobId,
      freelancer: userId
    });
    
    if (existingProposal) {
      return NextResponse.json(
        { message: 'You have already submitted a proposal for this job' },
        { status: 400 }
      );
    }
    
    // Validate budget
    if (!budget.amount || budget.amount <= 0) {
      return NextResponse.json(
        { message: 'Invalid budget amount' },
        { status: 400 }
      );
    }
    
    // Create proposal
    const proposal = await Proposal.create({
      job: jobId,
      freelancer: userId,
      title: title.trim(),
      description: description.trim(),
      budget: {
        amount: parseFloat(budget.amount),
        currency: budget.currency || 'HBAR'
      },
      timeline: timeline.trim(),
      milestones: milestones || [],
      status: 'pending'
    });
    
    // Update job's proposals array
    await Job.findByIdAndUpdate(jobId, {
      $push: { proposals: proposal._id }
    });
    
    return NextResponse.json(
      { 
        message: 'Proposal submitted successfully',
        proposal: {
          id: proposal._id,
          title: proposal.title,
          budget: proposal.budget,
          timeline: proposal.timeline,
          status: proposal.status,
          submittedAt: proposal.submittedAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit Proposal API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

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
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query: any = {};
    
    // Check if user is freelancer or client
    const freelancer = await Freelancer.findById(userId);
    const client = await Client.findById(userId);
    
    if (freelancer) {
      // Freelancer can only see their own proposals
      query.freelancer = userId;
    } else if (client) {
      // Client can see proposals for their jobs
      const clientJobs = await Job.find({ client: userId }).select('_id');
      const jobIds = clientJobs.map(job => job._id);
      query.job = { $in: jobIds };
    } else {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (jobId) {
      query.job = jobId;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch proposals
    const proposals = await Proposal.find(query)
      .populate({
        path: 'job',
        select: 'title budget duration category client',
        populate: {
          path: 'client',
          select: 'fullname avatar'
        }
      })
      .populate('freelancer', 'fullname avatar rating reviewCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Proposal.countDocuments(query);
    
    return NextResponse.json({
      proposals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Proposals API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}