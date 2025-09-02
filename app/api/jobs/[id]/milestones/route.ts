import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Job } from '@/models/Job';
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
    
    const { milestoneIndex, completed } = await request.json();
    
    if (typeof milestoneIndex !== 'number' || typeof completed !== 'boolean') {
      return NextResponse.json(
        { message: 'Invalid milestone data' },
        { status: 400 }
      );
    }
    
    // Find the job and verify freelancer ownership
    const job = await Job.findById(jobId).populate('freelancer', 'fullname');
    
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Only the assigned freelancer can update milestones
    if (job.freelancer._id.toString() !== userId) {
      return NextResponse.json(
        { message: 'Only the assigned freelancer can update milestones' },
        { status: 403 }
      );
    }
    
    // Verify milestone exists
    if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
      return NextResponse.json(
        { message: 'Invalid milestone index' },
        { status: 400 }
      );
    }
    
    // Update the milestone
    job.milestones[milestoneIndex].completed = completed;
    
    // Calculate new progress
    const completedCount = job.milestones.filter((m: any) => m.completed).length;
    const totalMilestones = job.milestones.length;
    job.progress = Math.round((completedCount / totalMilestones) * 100);
    
    // If all milestones are completed, mark job as completed
    if (completedCount === totalMilestones) {
      job.status = 'completed';
    } else if (job.status === 'completed' && completedCount < totalMilestones) {
      // If job was completed but now has incomplete milestones, set back to in_progress
      job.status = 'in_progress';
    }
    
    await job.save();
    
    // Also update the corresponding contract milestones
    const { Contract } = require('@/models/Contract');
    const contract = await Contract.findOne({ job: jobId });
    if (contract && contract.milestones[milestoneIndex]) {
      contract.milestones[milestoneIndex].completed = completed;
      await contract.save();
    }
    
    return NextResponse.json({
      message: 'Milestone updated successfully',
      job: {
        _id: job._id,
        progress: job.progress,
        status: job.status,
        milestones: job.milestones
      }
    });
    
  } catch (error) {
    console.error('Milestone update error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}