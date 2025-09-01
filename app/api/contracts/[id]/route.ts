import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Contract } from '@/models/Contract';
import { Job } from '@/models/Job';
import { Freelancer, Client } from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: contractId } = await params;
    
    // Find the contract and populate related data
    const contract = await Contract.findById(contractId)
      .populate('job', 'title description category skills budget deadline')
      .populate('client', 'fullname email avatar')
      .populate('freelancer', 'fullname email avatar')
      .populate('proposal', 'title description timeline');
      
    if (!contract) {
      return NextResponse.json(
        { message: 'Contract not found' },
        { status: 404 }
      );
    }
    
    // Verify user has access to this contract
    if (contract.client._id.toString() !== userId && contract.freelancer._id.toString() !== userId) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Get Contract API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: contractId } = await params;
    
    const requestBody = await request.json();
    const { action, signature, milestones } = requestBody;
    
    // Find the contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return NextResponse.json(
        { message: 'Contract not found' },
        { status: 404 }
      );
    }
    
    // Verify user has access to this contract
    if (contract.client.toString() !== userId && contract.freelancer.toString() !== userId) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Handle different actions
    switch (action) {
      case 'update_milestones':
        // Only client can update milestones and only before signing
        if (contract.client.toString() !== userId) {
          return NextResponse.json(
            { message: 'Only client can update milestones' },
            { status: 403 }
          );
        }
        
        if (contract.signatures.client.signed) {
          return NextResponse.json(
            { message: 'Cannot update milestones after contract is signed' },
            { status: 400 }
          );
        }
        
        if (!milestones || !Array.isArray(milestones)) {
          return NextResponse.json(
            { message: 'Invalid milestones data' },
            { status: 400 }
          );
        }
        
        contract.milestones = milestones;
        await contract.save();
        
        return NextResponse.json({
          message: 'Milestones updated successfully',
          contract: {
            id: contract._id,
            milestones: contract.milestones,
          }
        });
        
      case 'sign':
        const isClient = contract.client.toString() === userId;
        const isFreelancer = contract.freelancer.toString() === userId;
        
        if (isClient) {
          if (contract.signatures.client.signed) {
            return NextResponse.json(
              { message: 'Contract already signed by client' },
              { status: 400 }
            );
          }
          
          contract.signatures.client.signed = true;
          contract.signatures.client.signedAt = new Date();
          contract.signatures.client.signature = signature || `Client signature - ${new Date().toISOString()}`;
          
          // Update status based on current state
          if (contract.status === 'pending_client_signature') {
            contract.status = 'pending_escrow';
          }
        } else if (isFreelancer) {
          if (contract.signatures.freelancer.signed) {
            return NextResponse.json(
              { message: 'Contract already signed by freelancer' },
              { status: 400 }
            );
          }
          
          // Freelancer can only sign after client has signed and escrowed funds
          if (!contract.signatures.client.signed || !contract.escrow.funded) {
            return NextResponse.json(
              { message: 'Client must sign and escrow funds before freelancer can sign' },
              { status: 400 }
            );
          }
          
          contract.signatures.freelancer.signed = true;
          contract.signatures.freelancer.signedAt = new Date();
          contract.signatures.freelancer.signature = signature || `Freelancer signature - ${new Date().toISOString()}`;
          
          // If both signed and escrowed, contract becomes active
          if (contract.signatures.client.signed && contract.escrow.funded) {
            contract.status = 'active';
            contract.startDate = new Date();
            
            // Update job status to in_progress
            await Job.findByIdAndUpdate(contract.job, {
              status: 'in_progress',
              freelancer: contract.freelancer
            });
          }
        }
        break;
        
      case 'escrow':
        // Only client can escrow funds
        if (contract.client.toString() !== userId) {
          return NextResponse.json(
            { message: 'Only client can escrow funds' },
            { status: 403 }
          );
        }
        
        if (contract.escrow.funded) {
          return NextResponse.json(
            { message: 'Funds already escrowed' },
            { status: 400 }
          );
        }
        
        if (!contract.signatures.client.signed) {
          return NextResponse.json(
            { message: 'Client must sign contract before escrowing funds' },
            { status: 400 }
          );
        }
        
        contract.escrow.funded = true;
        contract.escrow.fundedAt = new Date();
        contract.status = 'pending_freelancer_signature';
        break;
        
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }
    
    await contract.save();
    
    return NextResponse.json({
      message: `Contract ${action} successful`,
      contract: {
        id: contract._id,
        status: contract.status,
        signatures: contract.signatures,
        escrow: contract.escrow,
      }
    });
  } catch (error) {
    console.error('Update Contract API Error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}