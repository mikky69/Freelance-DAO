import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Payment } from '@/models/Payment'
import { Client, Freelancer } from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.id

    // Identify payer role
    const client = await Client.findById(userId)
    const freelancer = client ? null : await Freelancer.findById(userId)
    if (!client && !freelancer) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const { reference, purpose, amountUsd, amountNgn } = await request.json()
    if (!reference || !purpose) {
      return NextResponse.json({ message: 'Missing reference or purpose' }, { status: 400 })
    }

    // Verify with Paystack
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      return NextResponse.json({ message: 'PAYSTACK_SECRET_KEY not configured' }, { status: 500 })
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }
    })
    const verifyData = await verifyRes.json()
    if (!verifyRes.ok || !verifyData?.status) {
      return NextResponse.json({ message: 'Failed to verify payment', details: verifyData }, { status: 400 })
    }

    const data = verifyData.data
    const status: 'success' | 'failed' = data.status === 'success' ? 'success' : 'failed'
    const amountMajor = (typeof data.amount === 'number') ? data.amount / 100 : (amountNgn || 0)
    const channel = data.channel

    const payment = await Payment.create({
      payer: userId,
      payerModel: client ? 'Client' : 'Freelancer',
      method: 'paystack',
      purpose,
      amount: amountMajor,
      currency: 'NGN',
      status,
      recipientModel: 'Platform',
      reference,
      channel,
      meta: { gateway: 'paystack', raw: data, usd_equivalent: amountUsd }
    })

    return NextResponse.json({ message: 'Payment verified', payment: { id: payment._id } }, { status: 200 })
  } catch (error) {
    console.error('Verify Payment API Error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

