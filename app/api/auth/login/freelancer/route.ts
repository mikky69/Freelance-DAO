import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { Freelancer } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    // Find freelancer
    const freelancer = await Freelancer.findOne({ email });
    if (!freelancer) {
      return NextResponse.json(
        { message: 'Freelancer not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, freelancer.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: freelancer._id, email: freelancer.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      message: 'Freelancer login successful',
      token,
    });
  } catch (error) {
    console.error('Freelancer Login Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}