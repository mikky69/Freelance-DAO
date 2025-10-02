import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Client, Freelancer } from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

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
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Check if user is freelancer or client
    const freelancer = await Freelancer.findById(userId);
    const client = await Client.findById(userId);
    
    if (!freelancer && !client) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Build query based on user type
    const query: any = {};
    
    if (freelancer) {
      // For freelancers, show jobs they're working on
      query.freelancer = userId;
    } else if (client) {
      // For clients, show jobs they posted
      query.client = userId;
    }
    
    if (status && status !== 'all') {
      // Map frontend status to backend status
      const statusMap: { [key: string]: string } = {
        'active': 'in_progress',
        'completed': 'completed',
        'open': 'open',
        'in_review': 'in_progress', // Could be a separate field in future
        'paused': 'in_progress', // Could be a separate field in future
        'draft': 'draft'
      };
      query.status = statusMap[status] || status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch projects (jobs)
    const projects = await Job.find(query)
      .populate('client', 'fullname avatar rating reviewCount verified')
      .populate('freelancer', 'fullname avatar rating reviewCount completedJobs')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Transform data to match frontend expectations
    const transformedProjects = projects.map((project: any) => {
      // Map backend status to frontend status
      let frontendStatus = 'draft';
      if (project.status === 'draft') frontendStatus = 'draft';
      else if (project.status === 'open') frontendStatus = 'open';
      else if (project.status === 'in_progress') frontendStatus = 'active';
      else if (project.status === 'completed') frontendStatus = 'completed';
      
      return {
        id: project._id,
        title: project.title,
        description: project.description,
        budget: project.budget?.amount || 0,
        currency: project.budget?.currency || 'HBAR',
        status: frontendStatus,
        priority: project.urgency || 'medium',
        category: project.category,
        skills: project.skills || [],
        postedDate: project.createdAt,
        deadline: project.deadline,
        proposals: project.proposals?.length || 0,
        hired: project.freelancer ? 1 : 0,
        freelancer: project.freelancer ? {
          name: project.freelancer.fullname,
          avatar: project.freelancer.avatar,
          rating: project.freelancer.rating || 0,
          completedJobs: project.freelancer.completedJobs || 0,
        } : null,
        progress: project.progress || 0,
        milestones: project.milestones || [],
        lastActivity: project.updatedAt,
        client: project.client ? {
          name: project.client.fullname,
          avatar: project.client.avatar,
          rating: project.client.rating || 0,
          verified: project.client.verified || false,
        } : null
      };
    });
    
    // Get total count for pagination
    const total = await Job.countDocuments(query);
    
    // Calculate stats
    const allUserProjects = await Job.find(
      freelancer ? { freelancer: userId } : { client: userId }
    ).lean();
    
    const stats = {
      total: allUserProjects.length,
      active: allUserProjects.filter(p => p.status === 'in_progress').length,
      completed: allUserProjects.filter(p => p.status === 'completed').length,
      draft: allUserProjects.filter(p => p.status === 'draft').length,
      totalBudget: allUserProjects.reduce((sum, p) => sum + (p.budget?.amount || 0), 0),
    };
    
    return NextResponse.json({
      projects: transformedProjects,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Projects API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}