import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Client, Freelancer } from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify token to exclude the current user from results
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const currentUserId = decoded.id;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const searchRegex = new RegExp(query, 'i');

    // Search in Clients
    const clients = await Client.find({
      $and: [
        { _id: { $ne: currentUserId } },
        {
          $or: [
            { fullname: searchRegex },
            { email: searchRegex }
          ]
        }
      ]
    }).select('_id fullname email avatar role').limit(5);

    // Search in Freelancers
    const freelancers = await Freelancer.find({
      $and: [
        { _id: { $ne: currentUserId } },
        {
          $or: [
            { fullname: searchRegex },
            { email: searchRegex }
          ]
        }
      ]
    }).select('_id fullname email avatar role').limit(5);

    // Combine and format results
    const users = [
      ...clients.map(c => ({
        id: c._id,
        name: c.fullname,
        avatar: c.avatar,
        role: 'client',
        email: c.email
      })),
      ...freelancers.map(f => ({
        id: f._id,
        name: f.fullname,
        avatar: f.avatar,
        role: 'freelancer',
        email: f.email
      }))
    ];

    return NextResponse.json({ users });

  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
