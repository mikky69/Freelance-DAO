import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { Conversation } from '@/models/Conversation';
import { Message } from '@/models/Message';
import { Freelancer, Client } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

function formatTimeAgo(date: Date) {
  const now = new Date().getTime();
  const diffInMinutes = Math.floor((now - date.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role?: string };

    // Resolve user type
    const freelancer = await Freelancer.findById(decoded.id).select('_id fullname avatar');
    const client = freelancer ? null : await Client.findById(decoded.id).select('_id fullname avatar');

    if (!freelancer && !client) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isFreelancer = !!freelancer;
    const userId = isFreelancer ? freelancer!._id : client!._id;

    // Fetch conversations for the user
    const conversations = await Conversation.find(isFreelancer ? { freelancer: userId } : { client: userId })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate('client', 'fullname avatar')
      .populate('freelancer', 'fullname avatar')
      .populate('job', 'title');

    // Build response list
    const response = [] as any[];
    for (const conv of conversations) {
      // Determine other party
      const otherParty: any = isFreelancer ? (conv as any).client : (conv as any).freelancer;
      const otherType = isFreelancer ? 'client' : 'freelancer';
      const avatar = (otherParty?.fullname || 'U')[0];

      // Last message
      const lastMsg = await Message.findOne({ conversation: conv._id }).sort({ createdAt: -1 });
      const lastMessage = lastMsg?.content || 'No messages yet';
      const lastMessageAt = lastMsg?.createdAt || conv.updatedAt;

      // Unread count for this user
      const unread = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: userId },
        readBy: { $nin: [userId] },
      });

      response.push({
        id: conv._id.toString(),
        name: otherParty?.fullname || 'Unknown',
        avatar,
        lastMessage,
        timestamp: formatTimeAgo(lastMessageAt),
        unread,
        online: false,
        project: (conv as any)?.job?.title || 'Direct Chat',
        type: otherType,
        otherPartyId: otherParty?._id?.toString(),
        jobId: (conv as any)?.job?._id?.toString(),
      });
    }

    return NextResponse.json({ conversations: response });
  } catch (error) {
    console.error('Conversations API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch conversations' }, { status: 500 });
  }
}