import mongoose from "mongoose";

const quizeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    type: { type: String, enum: ["skin", "hair"], required: true },
    answers: [{ questionId: String, answer: String }],
    result: { type: String, required: true }, // e.g., "Oily Skin", "Curly Hair"
    createdAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
    }
)
const QuizeModel = mongoose.models.Quize || mongoose.model("Quize", quizeSchema);

export default QuizeModel