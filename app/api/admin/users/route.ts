import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Freelancer, Client, Admin } from '@/models/User';
import { Job } from '@/models/Job';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Verify admin exists
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('type'); // 'freelancer', 'client', or 'all'
    const status = searchParams.get('status'); // 'active', 'suspended', 'pending'
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    let users: any[] = [];
    let totalCount = 0;
    
    // Build search query
    const buildSearchQuery = (search: string) => {
      if (!search) return {};
      return {
        $or: [
          { fullname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ]
      };
    };
    
    const searchQuery = search ? buildSearchQuery(search) : {};
    
    if (userType === 'freelancer' || userType === 'all' || !userType) {
      // Fetch freelancers
      const freelancers = await Freelancer.find(searchQuery)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(userType === 'freelancer' ? skip : 0)
        .limit(userType === 'freelancer' ? limit : (userType === 'all' ? limit / 2 : limit))
        .lean();
      
      // Get job stats for freelancers
      const freelancerUsers = await Promise.all(
        freelancers.map(async (freelancer: any) => {
          const completedJobs = await Job.countDocuments({
            freelancer: freelancer._id,
            status: 'completed'
          });
          
          const activeJobs = await Job.countDocuments({
            freelancer: freelancer._id,
            status: 'in_progress'
          });
          
          const totalEarnings = await Job.aggregate([
            {
              $match: {
                freelancer: freelancer._id,
                status: 'completed'
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$budget.amount' }
              }
            }
          ]);
          
          const earnings = totalEarnings.length > 0 ? totalEarnings[0].total : 0;
          
          return {
            id: freelancer._id,
            name: freelancer.fullname,
            email: freelancer.email,
            type: 'Freelancer',
            status: freelancer.verified ? 'Active' : 'Pending Verification',
            joined: freelancer.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            jobs: completedJobs + activeJobs,
            rating: freelancer.rating || 0,
            earnings: `${earnings.toLocaleString()} HBAR`,
            flags: 0, // TODO: Implement flagging system
            avatar: freelancer.avatar,
            verified: freelancer.verified,
            category: freelancer.category,
            skills: freelancer.skills
          };
        })
      );
      
      users = users.concat(freelancerUsers);
      
      if (userType === 'freelancer') {
        totalCount = await Freelancer.countDocuments(searchQuery);
      }
    }
    
    if (userType === 'client' || userType === 'all' || !userType) {
      // Fetch clients
      const clients = await Client.find(searchQuery)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(userType === 'client' ? skip : 0)
        .limit(userType === 'client' ? limit : (userType === 'all' ? limit / 2 : limit))
        .lean();
      
      // Get job stats for clients
      const clientUsers = await Promise.all(
        clients.map(async (client: any) => {
          const postedJobs = await Job.countDocuments({
            client: client._id
          });
          
          const totalSpent = await Job.aggregate([
            {
              $match: {
                client: client._id,
                status: 'completed'
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$budget.amount' }
              }
            }
          ]);
          
          const spent = totalSpent.length > 0 ? totalSpent[0].total : 0;
          
          return {
            id: client._id,
            name: client.fullname,
            email: client.email,
            type: 'Client',
            status: client.verified ? 'Active' : 'Pending Verification',
            joined: client.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            jobs: postedJobs,
            rating: client.rating || 0,
            spent: `${spent.toLocaleString()} HBAR`,
            flags: 0, // TODO: Implement flagging system
            avatar: client.avatar,
            verified: client.verified,
            company: client.company
          };
        })
      );
      
      users = users.concat(clientUsers);
      
      if (userType === 'client') {
        totalCount = await Client.countDocuments(searchQuery);
      }
    }
    
    if (userType === 'all' || !userType) {
      totalCount = await Freelancer.countDocuments(searchQuery) + await Client.countDocuments(searchQuery);
      // Sort combined results by join date
      users.sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());
      // Apply pagination to combined results
      users = users.slice(skip, skip + limit);
    }
    
    // Filter by status if specified
    if (status && status !== 'all') {
      users = users.filter(user => {
        if (status === 'active') return user.status === 'Active';
        if (status === 'pending') return user.status.includes('Pending');
        if (status === 'suspended') return user.status === 'Suspended';
        return true;
      });
    }
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Admin Users API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { userId, userType, action } = await request.json();
    
    if (!userId || !userType || !action) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const UserModel = userType === 'freelancer' ? Freelancer : Client;
    
    let updateData: any = {};
    
    switch (action) {
      case 'verify':
        updateData = { verified: true };
        break;
      case 'suspend':
        updateData = { verified: false, suspended: true };
        break;
      case 'activate':
        updateData = { verified: true, suspended: false };
        break;
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: `User ${action}d successfully`,
      user: {
        id: updatedUser._id,
        name: updatedUser.fullname,
        verified: updatedUser.verified
      }
    });
  } catch (error) {
    console.error('Update User API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}