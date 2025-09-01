import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Contract } from '@/models/Contract';
import { Job } from '@/models/Job';
import { Proposal } from '@/models/Proposal';
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
    
    // Verify user is a client
    const client = await Client.findById(userId);
    if (!client) {
      return NextResponse.json(
        { message: 'Only clients can create contracts' },
        { status: 403 }
      );
    }
    
    const { proposalId } = await request.json();
    
    if (!proposalId) {
      return NextResponse.json(
        { message: 'Proposal ID is required' },
        { status: 400 }
      );
    }
    
    // Find the proposal and populate job details
    const proposal = await Proposal.findById(proposalId)
      .populate('job')
      .populate('freelancer', 'fullname email');
      
    if (!proposal) {
      return NextResponse.json(
        { message: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    // Verify the client owns the job
    if (proposal.job.client.toString() !== userId) {
      return NextResponse.json(
        { message: 'You can only create contracts for your own jobs' },
        { status: 403 }
      );
    }
    
    // Check if proposal is accepted
    if (proposal.status !== 'accepted') {
      return NextResponse.json(
        { message: 'Can only create contracts for accepted proposals' },
        { status: 400 }
      );
    }
    
    // Check if contract already exists for this proposal
    const existingContract = await Contract.findOne({ proposal: proposalId });
    if (existingContract) {
      return NextResponse.json(
        { message: 'Contract already exists for this proposal', contractId: existingContract._id },
        { status: 200 }
      );
    }
    
    // Create contract with proposal details
    const contract = new Contract({
      job: proposal.job._id,
      proposal: proposalId,
      client: userId,
      freelancer: proposal.freelancer._id,
      title: proposal.job.title,
      description: proposal.description,
      budget: proposal.budget,
      milestones: proposal.milestones.map(milestone => ({
        name: milestone.name,
        description: `Milestone: ${milestone.name}`,
        amount: milestone.amount,
        duration: milestone.duration,
        completed: false,
      })),
      paymentTerms: {
        escrowAmount: proposal.budget.amount,
        releaseConditions: 'Payment will be released upon completion and approval of each milestone.',
        penaltyClause: 'Standard penalty clauses apply for breach of contract terms.',
      },
      escrow: {
        funded: false,
        amount: proposal.budget.amount,
        currency: proposal.budget.currency,
      },
      status: 'pending_client_signature',
    });
    
    await contract.save();
    
    return NextResponse.json(
      {
        message: 'Contract created successfully',
        contractId: contract._id,
        contract: {
          id: contract._id,
          status: contract.status,
          title: contract.title,
          budget: contract.budget,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Contract API Error:', error);
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
    const status = searchParams.get('status');
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
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch contracts
    const contracts = await Contract.find(query)
      .populate('job', 'title category')
      .populate('client', 'fullname avatar')
      .populate('freelancer', 'fullname avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Contract.countDocuments(query);
    
    return NextResponse.json({
      contracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get Contracts API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}