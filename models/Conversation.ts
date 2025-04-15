import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConversation extends Document {
  members: Types.ObjectId[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String },
    groupAvatar: { type: String },
  },
  { timestamps: true }
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
