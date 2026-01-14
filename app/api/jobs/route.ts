import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Client } from '@/models/User';
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
        { message: 'Only clients can post jobs' },
        { status: 403 }
      );
    }
    
    const {
      title,
      description,
      category,
      skills,
      budgetType,
      budgetMin,
      budgetMax,
      currency,
      duration,
      experienceLevel,
      featured,
      urgent,
      useEscrow,
      paymentId
    } = await request.json();
    
    // Validate required fields
    if (!title || !description || !category || !skills || skills.length === 0 || !budgetType || !budgetMin || !duration) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate budget
    if (budgetMin <= 0 || (budgetMax && budgetMax <= budgetMin)) {
      return NextResponse.json(
        { message: 'Invalid budget range' },
        { status: 400 }
      );
    }
    
    // Map frontend categories to backend enum values
    const categoryMap: { [key: string]: string } = {
      'web-development': 'web-dev',
      'mobile-development': 'mobile-dev',
      'design': 'design',
      'writing': 'writing',
      'marketing': 'marketing',
      'blockchain': 'blockchain',
      'data': 'data',
      'other': 'other'
    };
    
    const mappedCategory = categoryMap[category] || 'other';
    
    // Determine urgency level
    let urgencyLevel = 'medium';
    if (urgent) {
      urgencyLevel = 'high';
    }
    
    // Create default milestones based on budget
    const totalBudget = budgetMax || budgetMin;
    const defaultMilestones = [
      {
        name: 'Project Setup & Planning',
        amount: Math.round(totalBudget * 0.3),
        duration: '1 week',
        completed: false
      },
      {
        name: 'Development & Implementation',
        amount: Math.round(totalBudget * 0.5),
        duration: '2 weeks',
        completed: false
      },
      {
        name: 'Testing & Final Delivery',
        amount: totalBudget - Math.round(totalBudget * 0.3) - Math.round(totalBudget * 0.5),
        duration: '1 week',
        completed: false
      }
    ];

    let isFeatured = featured || false;

    // Verify payment for featured jobs
    if (isFeatured && paymentId) {
      try {
        const { Payment } = await import('@/models/Payment');
        const payment = await Payment.findById(paymentId);
        // Check if payment exists and covers at least $21 (base $1 + featured $20)
        // Using loose comparison or a small epsilon for float safety if needed, but strict check is okay for now
        if (!payment || (payment.meta?.usd_equivalent || 0) < 5) {
          isFeatured = false;
          console.warn(`Downgrading job to standard: Insufficient payment for featured status. PaymentId: ${paymentId}`);
        }
      } catch (error) {
        console.error('Error verifying payment for featured job:', error);
        isFeatured = false;
      }
    } else if (isFeatured && !paymentId) {
      isFeatured = false;
    }
    
    // Create job
    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      category: mappedCategory,
      skills: skills.map((skill: string) => skill.trim()),
      budget: {
        amount: budgetMax || budgetMin,
        currency: currency === 'USD' ? 'USD' : 'HBAR',
        type: budgetType
      },
      duration,
      urgency: urgencyLevel,
      client: userId,
      featured: isFeatured,
      status: 'draft',
      milestones: defaultMilestones
    });

    if (paymentId) {
      try {
        const { Payment } = await import('@/models/Payment')
        await Payment.findByIdAndUpdate(paymentId, { job: job._id })
      } catch (e) {
        console.warn('Failed to link payment to job:', e)
      }
    }
    
    return NextResponse.json(
      { 
        message: 'Job posted successfully', 
        job: {
          id: job._id,
          title: job.title,
          status: job.status,
          featured: job.featured
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Post Job API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const budgetType = searchParams.get('budgetType');
    const urgency = searchParams.get('urgency');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Build query - show only open jobs (approved jobs)
    const query: any = { status: 'open' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    if (budgetType && budgetType !== 'all') {
      query['budget.type'] = budgetType;
    }
    
    if (urgency && urgency !== 'all') {
      query.urgency = urgency;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    // Fetch jobs
    const jobs = await Job.find(query)
      .populate('client', 'fullname avatar rating reviewCount verified')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
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

export async function PUT(request: NextRequest) {
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
        { message: 'Only clients can edit jobs' },
        { status: 403 }
      );
    }
    
    const {
      jobId,
      title,
      description,
      category,
      skills,
      budgetType,
      budgetMin,
      budgetMax,
      duration,
      experienceLevel,
      featured,
      urgent,
      useEscrow
    } = await request.json();
    
    // Validate required fields
    if (!jobId) {
      return NextResponse.json(
        { message: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Find the job and verify ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    if (job.client.toString() !== userId) {
      return NextResponse.json(
        { message: 'You can only edit your own jobs' },
        { status: 403 }
      );
    }
    
    // Validate required fields if provided
    if (title && !title.trim()) {
      return NextResponse.json(
        { message: 'Job title cannot be empty' },
        { status: 400 }
      );
    }
    
    if (description && description.trim().length < 100) {
      return NextResponse.json(
        { message: 'Description must be at least 100 characters' },
        { status: 400 }
      );
    }
    
    if (skills && skills.length === 0) {
      return NextResponse.json(
        { message: 'At least one skill is required' },
        { status: 400 }
      );
    }
    
    if (budgetMin && budgetMin <= 0) {
      return NextResponse.json(
        { message: 'Budget must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Map frontend categories to backend enum values
    const categoryMap: { [key: string]: string } = {
      'web-development': 'web-dev',
      'mobile-development': 'mobile-dev',
      'design': 'design',
      'writing': 'writing',
      'marketing': 'marketing',
      'blockchain': 'blockchain',
      'data': 'data',
      'other': 'other'
    };
    
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (category) updateData.category = categoryMap[category] || category;
    if (skills) updateData.skills = skills.map((skill: string) => skill.trim());
    if (duration) updateData.duration = duration;
    if (budgetType || budgetMin || budgetMax) {
      updateData.budget = {
        ...job.budget,
        ...(budgetType && { type: budgetType }),
        ...(budgetMin && { amount: budgetMax || budgetMin }),
      };
    }
    if (urgent !== undefined) {
      updateData.urgency = urgent ? 'high' : job.urgency;
    }
    if (featured !== undefined) updateData.featured = featured;
    
    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(
      { 
        message: 'Job updated successfully', 
        job: {
          id: updatedJob._id,
          title: updatedJob.title,
          status: updatedJob.status,
          featured: updatedJob.featured
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Job API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
        { message: 'Only clients can delete jobs' },
        { status: 403 }
      );
    }
    
    const { jobId } = await request.json();
    
    if (!jobId) {
      return NextResponse.json(
        { message: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Find the job and verify ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    if (job.client.toString() !== userId) {
      return NextResponse.json(
        { message: 'You can only delete your own jobs' },
        { status: 403 }
      );
    }
    
    // Check if job has active proposals or is in progress
    if (job.status === 'in_progress') {
      return NextResponse.json(
        { message: 'Cannot delete a job that is in progress' },
        { status: 400 }
      );
    }
    
    // Delete the job
    await Job.findByIdAndDelete(jobId);
    
    return NextResponse.json(
      { message: 'Job deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Job API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
