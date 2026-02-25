import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/node';
import connectDB from '@/lib/mongodb';
import { Freelancer, Client } from '@/models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

const privy = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { accessToken, role } = await request.json();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 });
    }

    // Verify Privy access token
    const verifiedClaims = await privy.verifyAccessToken(accessToken);
    const privyUserId = verifiedClaims.userId;

    // Get user details from Privy
    const privyUser = await privy.getUser(privyUserId);
    const email = privyUser.email?.address || privyUser.google?.email || privyUser.apple?.email;

    if (!email) {
      return NextResponse.json({ error: 'Email not found in Privy profile' }, { status: 400 });
    }

    // Find user in our database
    let user = await Freelancer.findOne({ email });
    let userType = 'freelancer';

    if (!user) {
      user = await Client.findOne({ email });
      userType = 'client';
    }

    // If user doesn't exist, create them
    if (!user) {
      const selectedRole = role || 'freelancer';
      const fullname = email.split('@')[0];
      const dummyPassword = crypto.randomBytes(20).toString('hex');

      if (selectedRole === 'freelancer') {
        user = await Freelancer.create({
          fullname,
          email,
          password: dummyPassword, // Required by schema
          verified: true,
        });
        userType = 'freelancer';
      } else {
        user = await Client.create({
          fullname,
          email,
          password: dummyPassword, // Required by schema
          verified: true,
        });
        userType = 'client';
      }
    }

    // Generate our own JWT for the user
    const token = jwt.sign(
      { id: user._id, email: user.email, role: userType },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullname,
        role: userType,
        accountType: userType,
        isVerified: user.verified,
      }
    });

  } catch (error: any) {
    console.error('Privy Sync Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
