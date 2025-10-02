import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Admin } from '@/models/User';
import { Job } from '@/models/Job';
import { NotificationService } from '@/lib/notification-service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Verify admin exists
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const flagged = searchParams.get('flagged');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch jobs
    const jobs = await Job.find(query)
      .populate('client', 'fullname email avatar company verified')
      .populate('freelancer', 'fullname email avatar verified')
      .populate('proposals')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalCount = await Job.countDocuments(query);
    
    // Transform data for frontend
    const transformedJobs = jobs.map((job: any) => {
      // Calculate time ago
      const timeAgo = (date: Date) => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
          return 'Less than 1 hour ago';
        } else if (diffInHours < 24) {
          return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
      };
      
      // Map status for display
      const statusMap: { [key: string]: string } = {
        'draft': 'Draft',
        'published': 'Published',
        'open': 'Open',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      };
      
      // Check if job might be flagged (example criteria)
      const isFlagged = (
        job.status === 'in_progress' && 
        new Date().getTime() - new Date(job.updatedAt).getTime() > 14 * 24 * 60 * 60 * 1000
      ) || (
        job.budget?.amount > 10000 && job.status === 'open'
      );
      
      return {
        id: job._id,
        title: job.title,
        client: job.client?.fullname || 'Unknown Client',
        clientCompany: job.client?.company || '',
        freelancer: job.freelancer?.fullname || 'Not Assigned',
        budget: `${job.budget?.amount || 0} ${job.budget?.currency || 'HBAR'}`,
        status: statusMap[job.status] || job.status,
        proposals: job.proposals?.length || 0,
        created: timeAgo(job.createdAt),
        flagged: isFlagged,
        category: job.category,
        skills: job.skills || [],
        urgency: job.urgency,
        featured: job.featured,
        description: job.description,
        duration: job.duration,
        progress: job.progress || 0
      };
    });
    
    // Filter flagged jobs if requested
    let filteredJobs = transformedJobs;
    if (flagged === 'true') {
      filteredJobs = transformedJobs.filter(job => job.flagged);
    }
    
    return NextResponse.json({
      jobs: filteredJobs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Admin Jobs API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { jobId, action, reason } = await request.json();
    
    if (!jobId || !action) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    let updateData: any = {};
    
    switch (action) {
      case 'approve':
        updateData = { status: 'open', adminNote: reason || 'Approved by admin' };
        break;
      case 'reject':
        updateData = { status: 'cancelled', adminNote: reason || 'Rejected by admin' };
        break;
      case 'suspend':
        updateData = { status: 'cancelled', adminNote: reason || 'Suspended by admin' };
        break;
      case 'feature':
        updateData = { featured: true };
        break;
      case 'unfeature':
        updateData = { featured: false };
        break;
      case 'close':
        updateData = { status: 'cancelled' };
        break;
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      updateData,
      { new: true }
    ).populate('client', 'fullname');
    
    if (!updatedJob) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Send notification when job is approved
    if (action === 'approve' && updatedJob.client) {
      try {
        await NotificationService.notifyJobApproved(
          updatedJob.client._id.toString(),
          updatedJob.title,
          updatedJob._id.toString()
        );
      } catch (notificationError) {
        console.error('Failed to send job approval notification:', notificationError);
        // Don't fail the main operation if notification fails
      }
    }
    
    return NextResponse.json({
      message: `Job ${action}d successfully`,
      job: {
        id: updatedJob._id,
        title: updatedJob.title,
        status: updatedJob.status,
        featured: updatedJob.featured
      }
    });
  } catch (error) {
    console.error('Update Job API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}