import mongoose, { Document, Schema } from 'mongoose';

export interface IProposal extends Document {
  job: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  title: string;
  description: string;
  budget: {
    amount: number;
    currency: string;
  };
  timeline: string;
  milestones: {
    name: string;
    amount: number;
    duration: string;
  }[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSchema = new Schema<IProposal>({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  freelancer: {
    type: Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Proposal title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Proposal description is required'],
    trim: true,
    maxlength: 3000,
  },
  budget: {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ['HBAR', 'USD'],
      default: 'HBAR',
    },
  },
  timeline: {
    type: String,
    required: true,
  },
  milestones: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
      required: true,
    },
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Ensure a freelancer can only submit one proposal per job
ProposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });

export const Proposal = mongoose.models.Proposal || mongoose.model<IProposal>('Proposal', ProposalSchema);