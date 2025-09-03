import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Proposal } from '@/models/Proposal';
import { Job } from '@/models/Job';
import { Client, Freelancer } from '@/models/User';
import { NotificationService } from '@/lib/notification-service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
        { message: 'Only clients can manage proposals' },
        { status: 403 }
      );
    }
    
    const { action } = await request.json();
    const proposalId = params.id;
    
    // Validate action
    if (!['accepted', 'rejected'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action. Must be "accepted" or "rejected"' },
        { status: 400 }
      );
    }
    
    // Find the proposal and populate job and freelancer details
    const proposal = await Proposal.findById(proposalId)
      .populate('job')
      .populate('freelancer', 'fullname');
    if (!proposal) {
      return NextResponse.json(
        { message: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    // Verify the client owns the job
    if (proposal.job.client.toString() !== userId) {
      return NextResponse.json(
        { message: 'You can only manage proposals for your own jobs' },
        { status: 403 }
      );
    }
    
    // Check if proposal is already processed
    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { message: 'This proposal has already been processed' },
        { status: 400 }
      );
    }
    
    // Update the proposal status
    proposal.status = action;
    proposal.respondedAt = new Date();
    await proposal.save();
    
    // If accepting a proposal, reject all other pending proposals for the same job
    if (action === 'accepted') {
      // Get all other pending proposals for notification
      const otherProposals = await Proposal.find({
        job: proposal.job._id,
        _id: { $ne: proposalId },
        status: 'pending'
      }).populate('freelancer', 'fullname');
      
      await Proposal.updateMany(
        {
          job: proposal.job._id,
          _id: { $ne: proposalId },
          status: 'pending'
        },
        {
          status: 'rejected',
          respondedAt: new Date()
        }
      );
      
      // Update job status to in_progress and assign freelancer
      await Job.findByIdAndUpdate(proposal.job._id, {
        status: 'in_progress',
        freelancer: proposal.freelancer
      });
      
      // Send notifications
      try {
        // Notify accepted freelancer
        await NotificationService.notifyProposalAccepted(
          proposal.freelancer._id.toString(),
          client.fullname,
          proposal.job.title,
          proposal._id.toString(),
          '' // Contract ID will be added when contract is created
        );
        
        // Notify rejected freelancers
        const rejectedFreelancerIds = otherProposals.map(p => p.freelancer._id.toString());
        if (rejectedFreelancerIds.length > 0) {
          await NotificationService.notifyRejectedProposals(
            rejectedFreelancerIds,
            client.fullname,
            proposal.job.title
          );
        }
      } catch (notificationError) {
        console.error('Failed to send proposal response notifications:', notificationError);
        // Don't fail the main operation if notification fails
      }
    } else if (action === 'rejected') {
      // Send rejection notification
      try {
        await NotificationService.notifyProposalRejected(
          proposal.freelancer._id.toString(),
          client.fullname,
          proposal.job.title,
          proposal._id.toString()
        );
      } catch (notificationError) {
        console.error('Failed to send proposal rejection notification:', notificationError);
        // Don't fail the main operation if notification fails
      }
    }
    
    return NextResponse.json(
      { 
        message: `Proposal ${action} successfully`,
        proposal: {
          id: proposal._id,
          status: proposal.status,
          respondedAt: proposal.respondedAt
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Proposal API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const proposalId = params.id;
    
    // Find the proposal with populated data
    const proposal = await Proposal.findById(proposalId)
      .populate('job', 'title budget duration category client')
      .populate('freelancer', 'fullname avatar rating reviewCount')
      .lean();
    
    if (!proposal) {
      return NextResponse.json(
        { message: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to view this proposal
    const isFreelancer = proposal.freelancer._id.toString() === userId;
    const isClient = proposal.job.client.toString() === userId;
    
    if (!isFreelancer && !isClient) {
      return NextResponse.json(
        { message: 'You do not have permission to view this proposal' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Get Proposal API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}