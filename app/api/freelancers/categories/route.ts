import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Freelancer } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get category counts using aggregation
    const categoryCounts = await Freelancer.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get total count
    const totalCount = await Freelancer.countDocuments();
    
    // Format response with category details
    const categories = [
      { id: 'all', name: 'All Categories', count: totalCount },
      { id: 'web-dev', name: 'Web Development', count: 0 },
      { id: 'mobile-dev', name: 'Mobile Development', count: 0 },
      { id: 'design', name: 'Design & Creative', count: 0 },
      { id: 'writing', name: 'Writing & Content', count: 0 },
      { id: 'marketing', name: 'Digital Marketing', count: 0 },
      { id: 'data', name: 'Data & Analytics', count: 0 },
      { id: 'photography', name: 'Photography', count: 0 },
      { id: 'blockchain', name: 'Blockchain & Web3', count: 0 },
      { id: 'other', name: 'Other', count: 0 },
    ];
    
    // Update counts from database
    categoryCounts.forEach(({ _id, count }) => {
      const category = categories.find(cat => cat.id === _id);
      if (category) {
        category.count = count;
      }
    });
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}