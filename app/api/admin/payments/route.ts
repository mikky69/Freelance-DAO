import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Payment } from '@/models/Payment'
import { Admin } from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }

    const admin = await Admin.findById(decoded.id)
    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const payments = await Payment.find({})
      .populate('payer', 'fullname email')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Payment.countDocuments({})

    const items = payments.map((p: any) => ({
      id: p._id,
      date: p.createdAt,
      payerName: p.payer?.fullname || 'Unknown',
      payerEmail: p.payer?.email || 'N/A',
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      purpose: p.purpose,
      status: p.status,
      for: p.recipientModel || (p.purpose === 'job_post_fee' ? 'Platform' : 'N/A'),
      jobTitle: p.job?.title || null,
      reference: p.reference,
      channel: p.channel,
    }))

    return NextResponse.json({ payments: items, pagination: { page, limit, total } })
  } catch (error) {
    console.error('Admin Payments API Error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

