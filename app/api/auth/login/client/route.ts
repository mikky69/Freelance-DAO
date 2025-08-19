import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { Client } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    // Find client
    const client = await Client.findOne({ email });
    if (!client) {
      return NextResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, client.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: client._id, email: client.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      message: 'Client login successful',
      token,
    });
  } catch (error) {
    console.error('Client Login Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}