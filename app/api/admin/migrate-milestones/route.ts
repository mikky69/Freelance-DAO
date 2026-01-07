import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Contract } from '@/models/Contract';
import { Job } from '@/models/Job';
import { Admin } from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user from token and verify admin access
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;
    
    // Verify user is admin
    const user = await Admin.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Find all contracts with milestones
    const contracts = await Contract.find({
      milestones: { $exists: true, $ne: [] }
    });
    
    let syncedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const contract of contracts) {
      try {
        if (!contract.job) {
          continue;
        }
        
        const job = await Job.findById(contract.job);
        if (!job) {
          continue;
        }
        
        // Check if job already has matching milestones
        let needsSync = false;
        if (!job.milestones || job.milestones.length === 0) {
          needsSync = true;
        } else if (job.milestones.length !== contract.milestones.length) {
          needsSync = true;
        } else {
          for (let i = 0; i < job.milestones.length; i++) {
            const jobMilestone = job.milestones[i];
            const contractMilestone = contract.milestones[i];
            
            if (jobMilestone.name !== contractMilestone.name ||
                jobMilestone.amount !== contractMilestone.amount ||
                jobMilestone.completed !== contractMilestone.completed) {
              needsSync = true;
              break;
            }
          }
        }
        
        if (!needsSync) {
          continue;
        }
        
        // Sync contract milestones to job
        job.milestones = contract.milestones.map((milestone: any) => ({
          name: milestone.name,
          amount: milestone.amount,
          duration: milestone.duration || '1 week',
          completed: milestone.completed || false,
          completedAt: milestone.completedAt
        }));
        
        // Calculate progress based on completed milestones
        const completedCount = job.milestones.filter((m: any) => m.completed).length;
        job.progress = Math.round((completedCount / job.milestones.length) * 100);
        
        // Update job status if all milestones are completed
        if (completedCount === job.milestones.length && job.status !== 'completed') {
          job.status = 'completed';
        } else if (completedCount < job.milestones.length && job.status === 'completed') {
          job.status = 'in_progress';
        }
        
        await job.save();
        syncedCount++;
        
      } catch (error) {
        errorCount++;
        errors.push(`Contract ${contract._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return NextResponse.json({
      message: 'Migration completed successfully',
      summary: {
        totalContracts: contracts.length,
        syncedJobs: syncedCount,
        errors: errorCount,
        errorDetails: errors.slice(0, 10) // Limit error details to first 10
      }
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        message: 'Migration failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
