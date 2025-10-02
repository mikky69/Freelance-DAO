import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  skills: string[];
  category: string;
  duration: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  client: mongoose.Types.ObjectId;
  freelancer?: mongoose.Types.ObjectId;
  proposals: mongoose.Types.ObjectId[];
  deadline?: Date;
  milestones: {
    name: string;
    amount: number;
    duration: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  progress: number;
  featured: boolean;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: 5000,
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
    type: {
      type: String,
      required: true,
      enum: ['fixed', 'hourly'],
    },
  },
  skills: {
    type: [String],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0;
      },
      message: 'At least one skill is required'
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['web-dev', 'mobile-dev', 'design', 'writing', 'marketing', 'data', 'photography', 'blockchain', 'other'],
  },
  duration: {
    type: String,
    required: true,
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'open', 'in_progress', 'completed', 'cancelled'],
    default: 'draft',
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  freelancer: {
    type: Schema.Types.ObjectId,
    ref: 'Freelancer',
  },
  proposals: [{
    type: Schema.Types.ObjectId,
    ref: 'Proposal',
  }],
  deadline: {
    type: Date,
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
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  adminNote: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);