import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Admin } from '@/models/User';
import { Dispute } from '@/models/Dispute';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    const admin = await (Admin as any).findOne({ _id: decoded.id });
    if (!admin) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch disputes
    const disputes = await (Dispute as any).find(query)
      .populate('client', 'fullname email avatar')
      .populate('freelancer', 'fullname email avatar')
      .populate('job', 'title')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalCount = await Dispute.countDocuments(query);
    
    // Transform data for frontend
    const transformedDisputes = disputes.map((dispute: any) => {
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
        'pending': 'Pending',
        'under_review': 'Under Review',
        'awaiting_evidence': 'Awaiting Evidence',
        'mediation': 'Mediation',
        'resolved': 'Resolved',
        'closed': 'Closed'
      };
      
      return {
        id: dispute.id || `DSP-${dispute._id.toString().slice(-6)}`,
        title: dispute.title,
        client: dispute.client?.fullname || 'Unknown Client',
        freelancer: dispute.freelancer?.fullname || 'Unknown Freelancer',
        amount: `${dispute.amount} ${dispute.currency}`,
        status: statusMap[dispute.status] || dispute.status,
        priority: dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1),
        created: timeAgo(dispute.createdAt),
        description: dispute.description,
        category: dispute.category,
        jobTitle: dispute.job?.title || 'Unknown Job'
      };
    });
    
    return NextResponse.json({
      disputes: transformedDisputes,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Admin Disputes API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    
    const {
      title,
      description,
      jobId,
      clientId,
      freelancerId,
      amount,
      currency = 'HBAR',
      priority = 'medium',
      category
    } = await request.json();
    
    // Validate required fields
    if (!title || !description || !jobId || !clientId || !freelancerId || !amount || !category) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create dispute
    const dispute = await (Dispute as any).create({
      title: title.trim(),
      description: description.trim(),
      job: jobId,
      client: clientId,
      freelancer: freelancerId,
      amount,
      currency,
      priority,
      category,
      status: 'pending'
    });
    
    return NextResponse.json(
      { 
        message: 'Dispute created successfully',
        dispute: {
          id: dispute.id,
          title: dispute.title,
          status: dispute.status
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Dispute API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
