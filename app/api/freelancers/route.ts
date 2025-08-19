import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Freelancer } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minRate = searchParams.get('minRate');
    const maxRate = searchParams.get('maxRate');
    const verified = searchParams.get('verified');
    const topRated = searchParams.get('topRated');
    const availability = searchParams.get('availability');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Build query
    const query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = parseInt(minRate);
      if (maxRate) query.hourlyRate.$lte = parseInt(maxRate);
    }
    
    if (verified === 'true') {
      query.verified = true;
    }
    
    if (topRated === 'true') {
      query.topRated = true;
    }
    
    if (availability) {
      query.availability = availability;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch freelancers
    const freelancers = await Freelancer.find(query)
      .select('-password') // Exclude password field
      .sort({ topRated: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Freelancer.countDocuments(query);
    
    return NextResponse.json({
      freelancers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Freelancers API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}