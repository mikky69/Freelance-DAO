import { Notification } from '@/models/Notification';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export interface NotificationData {
  jobId?: string;
  proposalId?: string;
  contractId?: string;
  milestoneId?: string;
  senderId?: string;
  senderName?: string;
  amount?: number;
  currency?: string;
  actionUrl?: string;
}

export class NotificationService {
  static async createNotification({
    recipientId,
    recipientModel,
    type,
    title,
    message,
    data = {}
  }: {
    recipientId: string;
    recipientModel: 'Freelancer' | 'Client' | 'Admin';
    type: string;
    title: string;
    message: string;
    data?: NotificationData;
  }) {
    try {
      await connectDB();
      
      const notification = await Notification.create({
        recipient: new mongoose.Types.ObjectId(recipientId),
        recipientModel,
        type,
        title,
        message,
        data
      });
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Job approval notification
  static async notifyJobApproved(clientId: string, jobTitle: string, jobId: string) {
    return this.createNotification({
      recipientId: clientId,
      recipientModel: 'Client',
      type: 'job_approved',
      title: 'Job Approved',
      message: `Your job "${jobTitle}" has been approved by the admin and is now live.`,
      data: {
        jobId,
        actionUrl: `/jobs/${jobId}`
      }
    });
  }

  // Proposal submission notification
  static async notifyProposalSubmitted(
    clientId: string, 
    freelancerName: string, 
    jobTitle: string, 
    proposalId: string,
    jobId: string
  ) {
    return this.createNotification({
      recipientId: clientId,
      recipientModel: 'Client',
      type: 'proposal_submitted',
      title: 'New Proposal Received',
      message: `${freelancerName} submitted a proposal for your job "${jobTitle}".`,
      data: {
        proposalId,
        jobId,
        senderName: freelancerName,
        actionUrl: `/jobs/${jobId}?tab=proposals`
      }
    });
  }

  // Proposal acceptance notification
  static async notifyProposalAccepted(
    freelancerId: string,
    clientName: string,
    jobTitle: string,
    proposalId: string,
    contractId: string
  ) {
    return this.createNotification({
      recipientId: freelancerId,
      recipientModel: 'Freelancer',
      type: 'proposal_accepted',
      title: 'Proposal Accepted!',
      message: `Congratulations! ${clientName} accepted your proposal for "${jobTitle}". Please sign the contract to start working.`,
      data: {
        proposalId,
        contractId,
        senderName: clientName,
        actionUrl: `/contracts/${contractId}`
      }
    });
  }

  // Proposal rejection notification
  static async notifyProposalRejected(
    freelancerId: string,
    clientName: string,
    jobTitle: string,
    proposalId: string
  ) {
    return this.createNotification({
      recipientId: freelancerId,
      recipientModel: 'Freelancer',
      type: 'proposal_rejected',
      title: 'Proposal Not Selected',
      message: `Your proposal for "${jobTitle}" was not selected. Keep applying to other opportunities!`,
      data: {
        proposalId,
        senderName: clientName,
        actionUrl: '/jobs'
      }
    });
  }

  // Contract signed and escrow funded notification
  static async notifyContractSigned(
    freelancerId: string,
    clientName: string,
    jobTitle: string,
    contractId: string,
    amount: number,
    currency: string
  ) {
    return this.createNotification({
      recipientId: freelancerId,
      recipientModel: 'Freelancer',
      type: 'contract_signed',
      title: 'Contract Signed & Funded',
      message: `${clientName} has signed the contract and funded the escrow (${amount} ${currency}) for "${jobTitle}". You can now start working!`,
      data: {
        contractId,
        senderName: clientName,
        amount,
        currency,
        actionUrl: `/contracts/${contractId}`
      }
    });
  }

  // Milestone completion notification
  static async notifyMilestoneCompleted(
    clientId: string,
    freelancerName: string,
    jobTitle: string,
    milestoneName: string,
    contractId: string
  ) {
    return this.createNotification({
      recipientId: clientId,
      recipientModel: 'Client',
      type: 'milestone_completed',
      title: 'Milestone Completed',
      message: `${freelancerName} has marked milestone "${milestoneName}" as completed for "${jobTitle}". Please review and approve.`,
      data: {
        contractId,
        milestoneId: milestoneName,
        senderName: freelancerName,
        actionUrl: `/contracts/${contractId}`
      }
    });
  }

  // Payment received notification
  static async notifyPaymentReceived(
    freelancerId: string,
    clientName: string,
    amount: number,
    currency: string,
    jobTitle: string
  ) {
    return this.createNotification({
      recipientId: freelancerId,
      recipientModel: 'Freelancer',
      type: 'payment_received',
      title: 'Payment Received',
      message: `You received ${amount} ${currency} from ${clientName} for "${jobTitle}".`,
      data: {
        senderName: clientName,
        amount,
        currency,
        actionUrl: '/dashboard?tab=earnings'
      }
    });
  }

  // Bulk notification for rejected proposals when one is accepted
  static async notifyRejectedProposals(
    rejectedFreelancerIds: string[],
    clientName: string,
    jobTitle: string
  ) {
    const notifications = rejectedFreelancerIds.map(freelancerId => 
      this.createNotification({
        recipientId: freelancerId,
        recipientModel: 'Freelancer',
        type: 'proposal_rejected',
        title: 'Proposal Not Selected',
        message: `Your proposal for "${jobTitle}" was not selected. The client has chosen another freelancer.`,
        data: {
          senderName: clientName,
          actionUrl: '/jobs'
        }
      })
    );

    return Promise.all(notifications);
  }
}