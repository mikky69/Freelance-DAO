import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Feedback } from '@/models/Feedback';
import nodemailer from 'nodemailer';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    let content: string = '';
    let email: string = '';
    let userType: string = '';
    let isAnonymous: boolean = false;
    let images: string[] = [];
    
    // Check Content-Type to decide how to parse
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      content = formData.get('content') as string || '';
      email = formData.get('email') as string || '';
      userType = formData.get('userType') as string || 'guest';
      isAnonymous = formData.get('isAnonymous') === 'true';
      
      // Handle File Uploads
      const files = formData.getAll('images') as File[];
      
      if (files && files.length > 0) {
        for (const file of files) {
          if (file.size > 0) {
            try {
              // Create a unique filename
              const filename = `feedback/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
              
              // Upload to Vercel Blob
              const blob = await put(filename, file, {
                access: 'public',
              });
              
              images.push(blob.url);
            } catch (uploadError) {
              console.error('Failed to upload image:', uploadError);
            }
          }
        }
      }
    } else {
      // Fallback to JSON
      const body = await request.json();
      content = body.content;
      email = body.email;
      userType = body.userType;
      isAnonymous = body.isAnonymous;
    }
    
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
      images,
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

      const adminEmail = process.env.EMAIL_USER;
      
      if (adminEmail) {
        const subject = `New Feedback from ${isAnonymous ? 'Anonymous' : email || 'User'}`;
        
        const imagesHtml = images.map(url => 
          `<div style="margin: 10px 0;"><img src="${url}" alt="Attachment" style="max-width: 100%; max-height: 300px; border-radius: 4px;" /></div>`
        ).join('');

        const html = `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>New Feedback Received</h2>
            <p><strong>From:</strong> ${isAnonymous ? 'Anonymous' : email || 'Unknown'}</p>
            <p><strong>User Type:</strong> ${userType}</p>
            <p><strong>Content:</strong></p>
            <blockquote style="background: #f9f9f9; border-left: 5px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
              ${content}
            </blockquote>
            ${images.length > 0 ? `<h3>Attachments (${images.length})</h3>${imagesHtml}` : ''}
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
