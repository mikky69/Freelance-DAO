import mongoose, { type Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  content: string;
  email?: string;
  userType?: 'freelancer' | 'client' | 'guest';
  isAnonymous: boolean;
  images?: string[];
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    content: {
      type: String,
      required: [true, 'Feedback content is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    userType: {
      type: String,
      enum: ['freelancer', 'client', 'guest'],
      default: 'guest',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
