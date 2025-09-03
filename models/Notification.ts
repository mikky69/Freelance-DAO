import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  recipientModel: 'Freelancer' | 'Client' | 'Admin';
  type: 'job_approved' | 'proposal_submitted' | 'proposal_accepted' | 'proposal_rejected' | 'contract_signed' | 'milestone_completed' | 'payment_received' | 'dispute_created' | 'message_received' | 'review_received';
  title: string;
  message: string;
  data: {
    jobId?: mongoose.Types.ObjectId;
    proposalId?: mongoose.Types.ObjectId;
    contractId?: mongoose.Types.ObjectId;
    milestoneId?: string;
    senderId?: mongoose.Types.ObjectId;
    senderName?: string;
    amount?: number;
    currency?: string;
    actionUrl?: string;
  };
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Freelancer', 'Client', 'Admin']
  },
  type: {
    type: String,
    required: true,
    enum: [
      'job_approved',
      'proposal_submitted', 
      'proposal_accepted',
      'proposal_rejected',
      'contract_signed',
      'milestone_completed',
      'payment_received',
      'dispute_created',
      'message_received',
      'review_received'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  data: {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job'
    },
    proposalId: {
      type: Schema.Types.ObjectId,
      ref: 'Proposal'
    },
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract'
    },
    milestoneId: {
      type: String
    },
    senderId: {
      type: Schema.Types.ObjectId
    },
    senderName: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      enum: ['HBAR', 'USD']
    },
    actionUrl: {
      type: String,
      trim: true
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });

// Helper method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);