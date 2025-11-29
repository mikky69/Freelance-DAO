import mongoose, { Document, Schema } from 'mongoose'

export interface IPayment extends Document {
  payer: mongoose.Types.ObjectId
  payerModel: 'Client' | 'Freelancer' | 'Admin'
  method: 'paystack' | 'crypto'
  purpose: 'job_post_fee' | 'featured_fee' | 'escrow_deposit' | 'milestone_release'
  amount: number
  currency: 'NGN' | 'USD' | 'HBAR'
  status: 'success' | 'failed' | 'pending'
  job?: mongoose.Types.ObjectId
  recipient?: mongoose.Types.ObjectId
  recipientModel?: 'Client' | 'Freelancer' | 'Admin' | 'Platform'
  reference?: string
  channel?: string
  meta?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>({
  payer: { type: Schema.Types.ObjectId, required: true, refPath: 'payerModel' },
  payerModel: { type: String, required: true, enum: ['Client', 'Freelancer', 'Admin'] },
  method: { type: String, required: true, enum: ['paystack', 'crypto'] },
  purpose: { 
    type: String, 
    required: true, 
    enum: ['job_post_fee', 'featured_fee', 'escrow_deposit', 'milestone_release'] 
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, enum: ['NGN', 'USD', 'HBAR'] },
  status: { type: String, required: true, enum: ['success', 'failed', 'pending'], default: 'pending' },
  job: { type: Schema.Types.ObjectId, ref: 'Job' },
  recipient: { type: Schema.Types.ObjectId, refPath: 'recipientModel' },
  recipientModel: { type: String, enum: ['Client', 'Freelancer', 'Admin', 'Platform'] },
  reference: { type: String },
  channel: { type: String },
  meta: { type: Schema.Types.Mixed },
}, { timestamps: true })

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)

