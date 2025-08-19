import mongoose, { Document, Schema } from 'mongoose';

export interface IFreelancer extends Document {
  fullname: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClient extends Document {
  fullname: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const FreelancerSchema = new Schema<IFreelancer>({
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
}, {
  timestamps: true,
});

const ClientSchema = new Schema<IClient>({
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
}, {
  timestamps: true,
});

export const Freelancer = mongoose.models.Freelancer || mongoose.model<IFreelancer>('Freelancer', FreelancerSchema);
export const Client = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);