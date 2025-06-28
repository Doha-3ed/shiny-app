import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    type: { 
    type: String, 
    enum: ['order', 'post','comment', 'like'], 
    required: true 
  },
    message: { 
      type: String,

    },
     order: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order' 
    },
    post: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Post' 
    },
    comment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'comment' 
    },
    read: { 
      type: Boolean, 
      default: false 
    },
    readAt: {
    type: Date
  },
    metadata: { 
      type: Object, // لتخزين بيانات إضافية مثل رقم الطلب، المبلغ، إلخ
      default: {} 
    }
  },
  { timestamps: true }
);

// Pre-save hook to format messages
notificationSchema.pre("save", function(next) {
  if (this.isNew) {
    // Truncate long messages
    this.message = this.message.length > 100 
      ? `${this.message.substring(0, 97)}...` 
      : this.message;
  }
  next();
});

notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds:  2592000, partialFilterExpression: { read: false } }); // 7 daysو{ expireAfterSeconds: 2592000 } });


const NotificationModel = mongoose.models.notification || 
                    mongoose.model("notification", notificationSchema);

export default NotificationModel;
 