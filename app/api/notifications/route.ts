import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { Freelancer, Client, Admin } from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

// GET - Fetch notifications for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;
    
    // Verify user exists
    const freelancer = await Freelancer.findById(userId);
    const client = await Client.findById(userId);
    const admin = await Admin.findById(userId);
    
    if (!freelancer && !client && !admin) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unread') === 'true';
    
    // Build query
    const query: any = { recipient: userId };
    if (type) query.type = type;
    if (unreadOnly) query.read = false;
    
    // Fetch notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('data.jobId', 'title')
      .populate('data.proposalId', 'title')
      .populate('data.contractId', 'title');
    
    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });
    
    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      unreadCount
    });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create a new notification (internal use)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const {
      recipientId,
      recipientModel,
      type,
      title,
      message,
      data
    } = await request.json();
    
    // Validate required fields
    if (!recipientId || !recipientModel || !type || !title || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create notification
    const notification = await Notification.create({
      recipient: recipientId,
      recipientModel,
      type,
      title,
      message,
      data: data || {}
    });
    
    return NextResponse.json(
      { 
        message: 'Notification created successfully',
        notification 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { message: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;
    
    const { notificationIds, markAll } = await request.json();
    
    let result;
    
    if (markAll) {
      // Mark all notifications as read for the user
      result = await Notification.updateMany(
        { recipient: userId, read: false },
        { 
          read: true, 
          readAt: new Date() 
        }
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      result = await Notification.updateMany(
        { 
          _id: { $in: notificationIds },
          recipient: userId,
          read: false
        },
        { 
          read: true, 
          readAt: new Date() 
        }
      );
    } else {
      return NextResponse.json(
        { message: 'Invalid request parameters' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: 'Notifications marked as read',
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { message: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}