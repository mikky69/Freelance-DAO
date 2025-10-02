import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { Freelancer, Client } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { fullname, email, password } = await request.json();

    // Check if email exists in either collection
    const existingFreelancer = await Freelancer.findOne({ email });
    const existingClient = await Client.findOne({ email });
    
    if (existingFreelancer || existingClient) {
      return NextResponse.json(
        { message: 'Email already registered. Please use a different email or sign in.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create freelancer
    const freelancer = await Freelancer.create({
      fullname,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: freelancer._id, email: freelancer.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json(
      { 
        message: 'Freelancer registered successfully',
        token
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Freelancer Registration Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}