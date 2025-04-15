import { models, Schema } from "mongoose";
import mongoose from "mongoose";

interface IUser extends Document {
  id?: mongoose.Types.ObjectId;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  status?: string;
  avatar?: string;
  lastseen?: Date | boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: false,
    },
    avatar: {
      type: String,
    },
    lastseen: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
