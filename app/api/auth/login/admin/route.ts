import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { Admin } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      message: 'Admin login successful',
      token,
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}