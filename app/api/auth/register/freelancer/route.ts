import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { Freelancer, Client } from '@/models/User';

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

    return NextResponse.json(
      { message: 'Freelancer registered successfully' },
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