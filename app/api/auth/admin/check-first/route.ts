import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Admin } from '@/models/User';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    const isFirstAdmin = adminCount === 0;
    
    return NextResponse.json({ isFirstAdmin });
  } catch (error) {
    console.error('Check First Admin Error:', error);
    return NextResponse.json(
      { message: 'Server error', isFirstAdmin: false },
      { status: 500 }
    );
  }
}
