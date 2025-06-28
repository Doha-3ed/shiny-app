import axios from "axios";
import chatbotModel from "../../DB/models/chatbot.model.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";


export const addChatbotMessage = asyncHandler(async (req, res,next) => {
    const { message} = req.body;
    const userId = req.user._id;

  try {
    const response = await axios.post('https://17b5e764-66e7-45ac-9437-7339edd41364-00-2v37s8swkffvn.spock.replit.dev/chat', { message });
    const reply = response.data.response;

    // Save to MongoDB
   let chat = await chatbotModel.findOne({ userId });
    if(chat){
    await chatbotModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          conversations: { message, reply },
          lastUpdated: new Date()
        },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true, new: true } // ⚠️ ينشئ مستنداً جديداً إذا لم يوجد
    );
    }
    else{
      chat = await chatbotModel.create({
        userId,
        conversations: [{ message, reply }],
        lastUpdated: new Date()
      });
    }

    return res.json({ reply });
  } catch (error) {
    console.error('Chatbot API error:', error.message);
    return next(new Error("Chatbot API error: " + error.message));
  }
});

export const getChatbot=asyncHandler(async(req,res,next)=>{
  const chatbot = await chatbotModel.findOne({userId:req.user._id}).sort({ timestamp: -1 });
  if(!chatbot){
    return next(new Error("Chatbot not found"));
  }
  res.status(200).json({
    success: true,
      chatbot,
  });
})