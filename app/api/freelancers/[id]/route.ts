import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Freelancer } from '@/models/User';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    await connectDB();
    
    const { id } = (context?.params || {}).id ? context.params : (await Promise.resolve(context)).params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid freelancer ID' },
        { status: 400 }
      );
    }
    
    // Find freelancer
    const freelancer = await Freelancer.findById(id)
      .select('-password') // Exclude password field
      .lean();
    
    if (!freelancer) {
      return NextResponse.json(
        { message: 'Freelancer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ freelancer });
  } catch (error) {
    console.error('Freelancer Detail API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
