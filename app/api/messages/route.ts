import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { Conversation } from '@/models/Conversation';
import { Message } from '@/models/Message';
import { Freelancer, Client } from '@/models/User';
import { NotificationService } from '@/lib/notification-service';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

function formatTime(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const mm = minutes < 10 ? `0${minutes}` : minutes;
  return `${h}:${mm} ${ampm}`;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId) {
      return NextResponse.json({ message: 'conversationId is required' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role?: string };

    const freelancer = await Freelancer.findById(decoded.id).select('_id fullname');
    const client = freelancer ? null : await Client.findById(decoded.id).select('_id fullname');

    if (!freelancer && !client) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userId = freelancer ? freelancer._id : client!._id;

    // Verify conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
    }

    const hasAccess = (conversation.freelancer && conversation.freelancer.equals(userId)) ||
      (conversation.client && conversation.client.equals(userId));
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('sender', 'fullname');

    const response = messages.map((m: any) => ({
      id: m._id.toString(),
      sender: m.sender?._id?.equals(userId) ? 'You' : (m.sender?.fullname || 'Unknown'),
      content: m.content,
      timestamp: formatTime(m.createdAt),
      isOwn: m.sender?._id?.equals(userId),
      type: m.type || 'text',
      fileName: m.attachments?.[0]?.name,
      fileSize: m.attachments?.[0]?.size ? `${Math.round(m.attachments[0].size / 1024)} KB` : undefined,
    }));

    // Mark messages as read for this user
    await Message.updateMany({
      conversation: conversationId,
      sender: { $ne: userId },
      readBy: { $nin: [userId] },
    }, { $addToSet: { readBy: userId } });

    return NextResponse.json({ messages: response });
  } catch (error) {
    console.error('Messages GET API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role?: string };

    const freelancer = await Freelancer.findById(decoded.id).select('_id fullname');
    const client = freelancer ? null : await Client.findById(decoded.id).select('_id fullname');

    if (!freelancer && !client) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const senderId = freelancer ? freelancer._id : client!._id;
    const senderModel = freelancer ? 'Freelancer' : 'Client';
    const senderName = freelancer ? freelancer.fullname : client!.fullname;

    const body = await request.json();
    const { conversationId, recipientId, recipientRole, jobId, content, type } = body;

    let conversation = null as any;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });

      const hasAccess = (conversation.freelancer && conversation.freelancer.equals(senderId)) ||
        (conversation.client && conversation.client.equals(senderId));
      if (!hasAccess) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    } else {
      // Create or find conversation by participants
      if (!recipientId || !recipientRole) {
        return NextResponse.json({ message: 'recipientId and recipientRole required when conversationId is not provided' }, { status: 400 });
      }

      const isRecipientClient = recipientRole === 'client';
      const pair = senderModel === 'Freelancer'
        ? { freelancer: senderId, client: recipientId, job: jobId }
        : { client: senderId, freelancer: recipientId, job: jobId };

      conversation = await Conversation.findOne(pair);
      if (!conversation) {
        conversation = await Conversation.create(pair);
      }
    }

    const msg = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      senderModel,
      content,
      type: type || 'text',
      attachments: [],
      readBy: [senderId],
    });

    // Update conversation last message time
    conversation.lastMessageAt = msg.createdAt;
    await conversation.save();

    // Notify recipient
    const recipientIsClient = !!conversation.client && !conversation.client.equals(senderId);
    const recipientIdToNotify = recipientIsClient ? conversation.client!.toString() : conversation.freelancer!.toString();
    const recipientModel = recipientIsClient ? 'Client' : 'Freelancer';

    try {
      await NotificationService.createNotification({
        recipientId: recipientIdToNotify,
        recipientModel,
        type: 'message_received',
        title: 'New message',
        message: content?.slice(0, 120) || 'New message received',
        data: { senderId: senderId.toString(), senderName },
      });
    } catch (e) {
      console.warn('Failed to create message notification:', e);
    }

    const response = {
      id: msg._id.toString(),
      sender: 'You',
      content: msg.content,
      timestamp: formatTime(msg.createdAt),
      isOwn: true,
      type: msg.type || 'text',
    };

    return NextResponse.json({ message: response, conversationId: conversation._id.toString() }, { status: 201 });
  } catch (error) {
    console.error('Messages POST API Error:', error);
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 });
  }
}