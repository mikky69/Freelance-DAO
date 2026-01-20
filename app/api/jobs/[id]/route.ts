import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Job } from '@/models/Job'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const job = await Job.findById(params.id)
      .populate('client', 'fullname avatar verified rating reviewCount')
      .lean()
    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 })
    }
    return NextResponse.json({ job }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
