import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { Freelancer, Client, Admin } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; userId?: string; email: string; role?: string };
    
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Invalid token structure' },
        { status: 401 }
      );
    }
    
    // Check if role is specified in token
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(userId).select('-password');
      if (!admin) {
        return NextResponse.json(
          { message: 'Admin not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        id: admin._id,
        email: admin.email,
        name: admin.fullname,
        isVerified: true,
        accountType: 'admin',
        role: 'admin',
        avatar: admin.avatar
      });
    }
    
    // Try to find user in both collections
    let user = await Freelancer.findById(userId).select('-password');
    let userType = 'freelancer';
    
    if (!user) {
      user = await Client.findById(userId).select('-password');
      userType = 'client';
    }
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      name: user.fullname,
      isVerified: user.verified,
      accountType: userType,
      role: userType,
      profile: {
        title: user.title,
        bio: user.bio,
        location: user.location,
        category: user.category,
        hourlyRate: user.hourlyRate,
        company: user.company,
        skills: user.skills,
        languages: user.languages,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}