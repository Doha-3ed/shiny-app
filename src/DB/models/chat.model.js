import mongoose from "mongoose";
import { role } from "../../utilities/Enums.js";

const chatSchema = new mongoose.Schema({
  participants: [
    {
      participantId: { type: mongoose.Schema.Types.ObjectId,ref: "user", required: true },
      role: {
        type: String,
        enum:role,
        required: true
      }
    }
  ],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId,ref: "user", required: true },
      role: {
        type: String,
        enum: role,
        required: true
      },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  lastMessage: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

chatSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

const chatModel = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
export default chatModel;

 export const connectionUser=new Map()

