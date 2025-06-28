import mongoose from "mongoose";
import { answers } from "../../utilities/Enums.js";


const HairQuizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  
  answers: [{ type: String, enum: Object.values(answers), required: true }],
  result: { type: String, enum: ['Straight Hair', 'Wavy Hair', 'Curly Hair', 'Coily Hair', 'Oily Scalp / Needs Clarifying'], required: true },
  createdAt: { type: Date, default: Date.now }
},
{
  timestamps: true
}
)
const HairQuizResultModel = mongoose.models.HairQuizResult || mongoose.model('HairQuizResult', HairQuizResultSchema )
export default HairQuizResultModel