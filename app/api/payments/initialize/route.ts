import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Contract } from '@/models/Contract';
import { Client } from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

        const { contractId, amount } = await request.json();

        if (!contractId || !amount) {
            return NextResponse.json(
                { message: 'Contract ID and amount are required' },
                { status: 400 }
            );
        }

        // Verify Paystack configuration
        if (!PAYSTACK_SECRET_KEY) {
            return NextResponse.json(
                { message: 'Payment gateway not configured' },
                { status: 500 }
            );
        }

        // Find the contract
        const contract = await Contract.findById(contractId);
        if (!contract) {
            return NextResponse.json(
                { message: 'Contract not found' },
                { status: 404 }
            );
        }

        // Verify user is the client
        if (contract.client.toString() !== userId) {
            return NextResponse.json(
                { message: 'Only the client can fund this contract' },
                { status: 403 }
            );
        }

        // Verify amount matches contract escrow amount
        // Allow small floating point differences
        if (Math.abs(contract.paymentTerms.escrowAmount - amount) > 0.01) {
            return NextResponse.json(
                { message: 'Amount does not match contract escrow amount' },
                { status: 400 }
            );
        }

        // Get client details for Paystack
        const client = await Client.findById(userId);
        if (!client) {
            return NextResponse.json(
                { message: 'Client profile not found' },
                { status: 404 }
            );
        }

        // Convert USD to NGN
        // Using a fallback rate if API fails, but trying API first
        let exchangeRate = 1500; // Fallback rate (1 USD = 1500 NGN)
        try {
            const rateResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (rateResponse.ok) {
                const rateData = await rateResponse.json();
                if (rateData.rates && rateData.rates.NGN) {
                    exchangeRate = rateData.rates.NGN;
                }
            }
        } catch (error) {
            console.error('Failed to fetch exchange rate:', error);
            // Continue with fallback rate
        }

        const amountNgn = Math.ceil(amount * exchangeRate);
        const amountKobo = amountNgn * 100; // Paystack expects amount in kobo (lowest currency unit)

        // Initialize Paystack transaction
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: client.email,
                amount: amountKobo,
                currency: 'NGN',
                reference: `escrow_${contractId}_${Date.now()}`,
                callback_url: `${request.nextUrl.origin}/contracts/${contractId}`,
                metadata: {
                    contract_id: contractId,
                    purpose: 'contract_escrow',
                    amount_usd: amount,
                    exchange_rate: exchangeRate,
                    client_id: userId,
                },
            }),
        });

        const paystackData = await paystackResponse.json();

        if (!paystackResponse.ok || !paystackData.status) {
            return NextResponse.json(
                { message: 'Failed to initialize payment', details: paystackData },
                { status: 400 }
            );
        }

        return NextResponse.json({
            authorization_url: paystackData.data.authorization_url,
            access_code: paystackData.data.access_code,
            reference: paystackData.data.reference,
            amount_ngn: amountNgn,
            exchange_rate: exchangeRate,
        });

    } catch (error) {
        console.error('Initialize Payment API Error:', error);
        return NextResponse.json(
            { message: 'Server error' },
            { status: 500 }
        );
    }
}
