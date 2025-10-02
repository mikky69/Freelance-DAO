import mongoose, { Document, Schema } from 'mongoose';

export interface IContract extends Document {
  job: mongoose.Types.ObjectId;
  proposal: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  title: string;
  description: string;
  budget: {
    amount: number;
    currency: string;
  };
  milestones: {
    name: string;
    description: string;
    amount: number;
    duration: string;
    completed: boolean;
  }[];
  paymentTerms: {
    escrowAmount: number;
    releaseConditions: string;
    penaltyClause: string;
  };
  signatures: {
    client: {
      signed: boolean;
      signedAt?: Date;
      signature?: string;
    };
    freelancer: {
      signed: boolean;
      signedAt?: Date;
      signature?: string;
    };
  };
  escrow: {
    funded: boolean;
    fundedAt?: Date;
    amount: number;
    currency: string;
  };
  status: 'draft' | 'pending_client_signature' | 'pending_freelancer_signature' | 'pending_escrow' | 'active' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  proposal: {
    type: Schema.Types.ObjectId,
    ref: 'Proposal',
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
  title: {
    type: String,
    required: [true, 'Contract title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Contract description is required'],
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
  },
  milestones: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
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
  }],
  paymentTerms: {
    escrowAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    releaseConditions: {
      type: String,
      required: true,
      default: 'Payment will be released upon completion and approval of each milestone.',
    },
    penaltyClause: {
      type: String,
      default: 'Standard penalty clauses apply for breach of contract terms.',
    },
  },
  signatures: {
    client: {
      signed: {
        type: Boolean,
        default: false,
      },
      signedAt: {
        type: Date,
      },
      signature: {
        type: String,
      },
    },
    freelancer: {
      signed: {
        type: Boolean,
        default: false,
      },
      signedAt: {
        type: Date,
      },
      signature: {
        type: String,
      },
    },
  },
  escrow: {
    funded: {
      type: Boolean,
      default: false,
    },
    fundedAt: {
      type: Date,
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
  },
  status: {
    type: String,
    enum: ['draft', 'pending_client_signature', 'pending_freelancer_signature', 'pending_escrow', 'active', 'completed', 'cancelled'],
    default: 'draft',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
ContractSchema.index({ job: 1 });
ContractSchema.index({ client: 1 });
ContractSchema.index({ freelancer: 1 });
ContractSchema.index({ status: 1 });
ContractSchema.index({ createdAt: -1 });

export const Contract = mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);