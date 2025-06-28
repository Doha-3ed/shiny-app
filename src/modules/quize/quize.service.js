import HairQuizResultModel from "../../DB/models/hairQuize.model.js";
import skinQuizResultModel from "../../DB/models/skinQuize.model.js";
import userModel from "../../DB/models/user.model.js";

import { asyncHandler } from "../../utilities/globalErrorHandling.js";


import axios from 'axios';

export const addhairQuize = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { answers } = req.body;

  // 🔁 Call Python microservice to get result
  let result;
  try {
    const response = await axios.post('https://958e4784-1ec6-4d42-b9f3-14ab1821a8e2-00-1rybzawv8qx7u.spock.replit.dev/quiz/hair', { answers });
    result = response.data.hairType;
  } catch (error) {
    return next(new Error("Failed to evaluate hair quiz result: " + (error.response?.data?.error || error.message)));
  }

  // ✅ Save result to MongoDB
 let quiz = await HairQuizResultModel.findOne({ userId });
  if (quiz) {
    quiz.answers = answers;
    quiz.result = result;
    await quiz.save();
  } else {
    quiz = await HairQuizResultModel.create({ userId, answers, result });
    if (!quiz) return next(new Error("quiz not created"));
  }

  await userModel.findOneAndUpdate({ _id: userId }, {
    $set: { "completedQuizzes.hair": true, hairType: result }
  }, { new: true });

  res.status(201).json({ message: 'Hair quiz result saved', quiz });
});



export const addskinQuize = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { answers } = req.body;

  // 🔁 Call Python microservice to get result
  let result;
  try {
    const response = await axios.post('https://958e4784-1ec6-4d42-b9f3-14ab1821a8e2-00-1rybzawv8qx7u.spock.replit.dev/quiz/skin', { answers });
    result = response.data.skinType; // ✅ Fix key name here
  } catch (error) {
    return next(new Error("Failed to evaluate skin quiz result: " + (error.response?.data?.error || error.message)));
  }

  let quiz = await skinQuizResultModel.findOne({ userId });
  if (quiz) {
    quiz.answers = answers;
    quiz.result = result;
    await quiz.save();
  } else {
    quiz = await skinQuizResultModel.create({ userId, answers, result });
    if (!quiz) return next(new Error("quiz not created"));
  }

  await userModel.findOneAndUpdate({ _id: userId }, {
    $set: { "completedQuizzes.skin": true, skinType: result }
  }, { new: true });

  res.status(201).json({ message: 'Skin quiz result saved', quiz });
});


export const getHairQuizResult=asyncHandler(async(req,res)=>{
   ;
    const quiz = await HairQuizResultModel.findOne({userId:req.user._id});
    if(!quiz){
      return res.status(404).json({
        success: false,
        message: "quiz not found"})
      }
      return res.status(200).json({
        success: true,
        message: "quiz fetched successfully",
        quiz
      })
    })

    export const getSkinQuizResult=asyncHandler(async(req,res)=>{
   
    const quiz = await skinQuizResultModel.findOne({userId:req.user._id})
    if(!quiz){
      return res.status(404).json({
        success: false,
        message: "quiz not found"})
      }
      return res.status(200).json({
        success: true,
        message: "quiz fetched successfully",
        result:quiz.result
      })
    })
