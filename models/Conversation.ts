import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  client?: mongoose.Types.ObjectId;
  freelancer?: mongoose.Types.ObjectId;
  job?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  client: { type: Schema.Types.ObjectId, ref: 'Client' },
  freelancer: { type: Schema.Types.ObjectId, ref: 'Freelancer' },
  job: { type: Schema.Types.ObjectId, ref: 'Job' },
  lastMessageAt: { type: Date },
}, {
  timestamps: true,
});

ConversationSchema.index({ client: 1, freelancer: 1, job: 1 });
ConversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);