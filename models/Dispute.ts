import mongoose, { Document, Schema } from 'mongoose';

export interface IDispute extends Document {
  id: string;
  title: string;
  description: string;
  job: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'under_review' | 'awaiting_evidence' | 'mediation' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: 'payment' | 'quality' | 'timeline' | 'scope' | 'communication' | 'other';
  evidence: {
    submittedBy: mongoose.Types.ObjectId;
    type: 'text' | 'file' | 'image';
    content: string;
    submittedAt: Date;
  }[];
  resolution?: {
    decision: string;
    resolvedBy: mongoose.Types.ObjectId;
    resolvedAt: Date;
    compensationAmount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>({
  title: {
    type: String,
    required: [true, 'Dispute title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Dispute description is required'],
    trim: true,
    maxlength: 2000,
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  freelancer: {
    type: Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true,
  },
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
  status: {
    type: String,
    enum: ['pending', 'under_review', 'awaiting_evidence', 'mediation', 'resolved', 'closed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['payment', 'quality', 'timeline', 'scope', 'communication', 'other'],
    required: true,
  },
  evidence: [{
    submittedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'evidence.submittedByModel'
    },
    submittedByModel: {
      type: String,
      required: true,
      enum: ['Client', 'Freelancer', 'Admin']
    },
    type: {
      type: String,
      enum: ['text', 'file', 'image'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  resolution: {
    decision: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    resolvedAt: {
      type: Date,
    },
    compensationAmount: {
      type: Number,
      min: 0,
    },
  },
}, {
  timestamps: true,
});

// Generate custom dispute ID
DisputeSchema.pre('save', function(next) {
  if (!this.id) {
    const timestamp = Date.now().toString().slice(-6);
    this.id = `DSP-${timestamp}`;
  }
  next();
});

export const Dispute = mongoose.models.Dispute || mongoose.model<IDispute>('Dispute', DisputeSchema);