import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { Freelancer, Client, Admin } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { fullname, email, password, adminToken } = await request.json();

    // Check if email exists in any collection
    const existingFreelancer = await Freelancer.findOne({ email });
    const existingClient = await Client.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingFreelancer || existingClient || existingAdmin) {
      return NextResponse.json(
        { message: 'Email already registered. Please use a different email or sign in.' },
        { status: 409 }
      );
    }

    // Check if this is the first admin
    const adminCount = await Admin.countDocuments();
    const isFirstAdmin = adminCount === 0;

    // If not first admin, verify adminToken (existing admin must be logged in)
    if (!isFirstAdmin) {
      if (!adminToken) {
        return NextResponse.json(
          { message: 'Admin token required to create new admin accounts' },
          { status: 401 }
        );
      }

      try {
        // Verify the admin token
        const decoded = jwt.verify(adminToken, JWT_SECRET) as { id: string; email: string; role: string };
        
        // Check if the token belongs to an admin
        const requestingAdmin = await Admin.findById(decoded.id);
        if (!requestingAdmin) {
          return NextResponse.json(
            { message: 'Only existing admins can create new admin accounts' },
            { status: 403 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { message: 'Invalid admin token' },
          { status: 401 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      fullname,
      email,
      password: hashedPassword,
      isFirstAdmin,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json(
      { 
        message: 'Admin registered successfully',
        token
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin Registration Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}