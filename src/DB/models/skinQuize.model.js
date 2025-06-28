import mongoose from "mongoose";
import { answers } from "../../utilities/Enums.js";


const skinQuizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    
  answers: [{ type: String, enum: Object.values(answers), required: true }],
  result: { type: String, enum: ['Normal skin', 'Dry skin', 'Oily skin', 'Combination skin', 'Sensitive skin'], required: true }
},
{
  timestamps: true
}
)
const skinQuizResultModel = mongoose.models.skinQuizResult || mongoose.model('skinQuizResult', skinQuizResultSchema )
export default skinQuizResultModel