import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query: any = { freelancer: userId };
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch proposals
    const proposals = await Proposal.find(query)
      .populate('job', 'title client budget deadline')
      .populate('job.client', 'fullname avatar')
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
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Proposals API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

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
    
    const { jobId, title, description, budget, timeline, milestones } = await request.json();
    
    // Create proposal
    const proposal = await Proposal.create({
      job: jobId,
      freelancer: userId,
      title,
      description,
      budget,
      timeline,
      milestones: milestones || [],
    });
    
    return NextResponse.json(
      { message: 'Proposal submitted successfully', proposal },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Proposal API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}