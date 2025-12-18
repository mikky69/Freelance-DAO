import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Feedback } from '@/models/Feedback';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { content, email, userType, isAnonymous } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { message: 'Feedback content is required' },
        { status: 400 }
      );
    }
    
    // Save to Database
    const feedback = await Feedback.create({
      content,
      email: isAnonymous ? undefined : email,
      userType,
      isAnonymous,
    });
    
    // Send Email to Admin
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // If env vars are not set, this might fail silently or throw. 
      // Ideally we should check if they exist, but for now we follow the pattern.
      
      const adminEmail = process.env.EMAIL_USER;
      
      if (adminEmail) {
        const subject = `New Feedback from ${isAnonymous ? 'Anonymous' : email || 'User'}`;
        const html = `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>New Feedback Received</h2>
            <p><strong>From:</strong> ${isAnonymous ? 'Anonymous' : email || 'Unknown'}</p>
            <p><strong>User Type:</strong> ${userType}</p>
            <p><strong>Content:</strong></p>
            <blockquote style="background: #f9f9f9; border-left: 5px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
              ${content}
            </blockquote>
            <p><small>Received at ${new Date().toLocaleString()}</small></p>
          </div>
        `;

        await transporter.sendMail({
          from: `FreelanceDAO Feedback <${process.env.EMAIL_USER}>`,
          to: adminEmail,
          subject,
          html,
        });
      }
    } catch (emailError) {
      console.error('Failed to send feedback email:', emailError);
      // We don't fail the request if email fails, but we log it.
    }
    
    return NextResponse.json(
      { message: 'Feedback submitted successfully', feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feedback Submission Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
