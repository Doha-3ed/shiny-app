import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"]
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    
    attachments: [{
      type: { type: String, enum: ["image", "video", "document"] },
      secure_url: String,
      public_id: String
    }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
     
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    }],
    onModel: {
      type: String,
      enum: ["comment", "Post"],
      required: true
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "onModel"
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      default: null
    },
    repliesCount: {
      type: Number,
      default: 0
    },
    editedAt: {
      type: Date
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for replies
commentSchema.virtual("replies", {
  ref: "comment",
  localField: "_id",
  foreignField: "parentId",
  match: { isDeleted: false }
});

// Indexes for better performance
/*commentSchema.index({ refId: 1, onModel: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ userId: 1 });*/

// Middleware for soft delete and notifications
commentSchema.pre("save", function(next) {
  if (this.isModified("content")) {
    this.editedAt = new Date();
  }
  next();
});

commentSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
  // Soft delete nested comments
  await mongoose.model("comment").updateMany(
    { parentId: this._id }, 
    { isDeleted: true }
  );
  
  // Decrement replies count if this is a reply
  if (this.parentId) {
    await mongoose.model("comment").findByIdAndUpdate(
      this.parentId,
      { $inc: { repliesCount: -1 } }
    );
  }
  
  next();
});


   

const Comment = mongoose.models.comment || mongoose.model("comment", commentSchema);
export default Comment;