import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true // ⚠️ يضمن مستند واحد لكل مستخدم
  },
  conversations: [{
    message: String,
    reply: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
},{
  timestamps: true
});

chatHistorySchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

const chatbotModel = mongoose.models.Chatbot || mongoose.model("Chatbot", chatHistorySchema);
export default chatbotModel;