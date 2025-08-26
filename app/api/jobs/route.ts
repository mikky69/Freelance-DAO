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
      duration,
      experienceLevel,
      featured,
      urgent,
      useEscrow
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
    
    // Create job
    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      category: mappedCategory,
      skills: skills.map((skill: string) => skill.trim()),
      budget: {
        amount: budgetMax || budgetMin,
        currency: 'HBAR',
        type: budgetType
      },
      duration,
      urgency: urgencyLevel,
      client: userId,
      featured: featured || false,
      status: 'open'
    });
    
    // If featured job, deduct payment from client (this would integrate with payment system)
    if (featured) {
      // TODO: Implement featured job payment logic
      console.log('Featured job payment would be processed here');
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
    
    // Build query
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