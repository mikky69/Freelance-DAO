import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment {
  url: string;
  name?: string;
  size?: number;
}

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderModel: 'Freelancer' | 'Client' | 'Admin';
  content: string;
  type: 'text' | 'image' | 'file';
  attachments?: IAttachment[];
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
  senderModel: { type: String, required: true, enum: ['Freelancer', 'Client', 'Admin'] },
  content: { type: String, trim: true },
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  attachments: [{
    url: { type: String, trim: true },
    name: { type: String, trim: true },
    size: { type: Number },
  }],
  readBy: [{ type: Schema.Types.ObjectId }],
}, {
  timestamps: true,
});

MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ conversation: 1, readBy: 1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);