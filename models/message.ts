import mongoose, { Types } from "mongoose";
import { Schema } from "mongoose";

interface IMessage extends Document {
  id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Message =
  mongoose.models.message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;
