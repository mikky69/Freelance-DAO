import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Client } from '@/models/User';
import { NotificationService } from '@/lib/notification-service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: jobId } = await params;
    
    // Verify user is a client
    const client = await Client.findById(userId);
    if (!client) {
      return NextResponse.json(
        { message: 'Only clients can approve jobs' },
        { status: 403 }
      );
    }
    
    const { approved } = await request.json();
    
    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { message: 'Invalid approval status' },
        { status: 400 }
      );
    }
    
    // Find the job and verify client ownership
    const job = await Job.findById(jobId)
      .populate('client', 'fullname')
      .populate('freelancer', 'fullname');
    
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Verify the client owns this job
    if (job.client._id.toString() !== userId) {
      return NextResponse.json(
        { message: 'You can only approve your own jobs' },
        { status: 403 }
      );
    }
    
    // Check if job is in the right state (completed with 100% progress)
    if (job.status !== 'completed' || job.progress !== 100) {
      return NextResponse.json(
        { message: 'Job must be completed with 100% progress to approve' },
        { status: 400 }
      );
    }
    
    if (approved) {
      // Approve the job - mark as fully completed and approved
      job.status = 'completed'; //changed from approved to completed to fix the error here
      
      // Send payment notification to freelancer
      if (job.freelancer) {
        try {
          await NotificationService.notifyPaymentReceived(
            job.freelancer._id.toString(),
            client.fullname,
            job.budget.amount,
            job.budget.currency,
            job.title
          );
        } catch (notificationError) {
          console.error('Failed to send payment notification:', notificationError);
        }
      }
    } else {
      // Request revisions - set back to in_progress
      job.status = 'in_progress';
      job.progress = 90; // Set to 90% to indicate revisions needed
      
      // Send revision request notification to freelancer
      if (job.freelancer) {
        try {
          await NotificationService.createNotification({
            recipientId: job.freelancer._id.toString(),
            recipientModel: 'Freelancer',
            type: 'milestone_completed', // Reusing this type for revision requests
            title: 'Revisions Requested',
            message: `${client.fullname} has requested revisions for "${job.title}". Please review the feedback and make necessary changes.`,
            data: {
              jobId: job._id.toString(),
              senderName: client.fullname,
              actionUrl: `/dashboard`
            }
          });
        } catch (notificationError) {
          console.error('Failed to send revision request notification:', notificationError);
        }
      }
    }
    
    await job.save();
    
    return NextResponse.json({
      message: approved ? 'Job approved successfully' : 'Revisions requested successfully',
      job: {
        _id: job._id,
        status: job.status,
        progress: job.progress
      }
    });
    
  } catch (error) {
    console.error('Job approval error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}