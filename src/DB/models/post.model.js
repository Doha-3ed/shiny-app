import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  
  content: { type: String, required: true },
  images: [{
    url: String,
    publicId: String
  }],
  topics: [String], // e.g., ["hair-care", "skin-treatment"]
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

postSchema.pre("findOneAndDelete", { document: true, query: false }, async function (next) {
  const postId = this._id;

  await mongoose.model("comment").deleteMany({
    refId: postId,
    onModel: "Post" 
  });

  next();
});
const postModel = mongoose.models.Post || mongoose.model("Post", postSchema);
export default postModel;