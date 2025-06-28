import mongoose from "mongoose";
import chatModel, { connectionUser } from "../../DB/models/chat.model.js";
import { authSocket } from "../../middleWare/authentication.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";

export const registerAccount = async (socket) => {
  const data = await authSocket({ socket });

  if (![200, 201].includes(data.statusCode)) {
    return socket.emit("authError", data);
  }

  socket.user = data.user;

  // 👇 لو كان في سوكت سابق لنفس اليوزر احذفه
  const existingSocketId = connectionUser.get(data.user._id.toString());
  if (existingSocketId && existingSocketId !== socket.id) {
    connectionUser.delete(data.user._id.toString());
  }

  connectionUser.set(data.user._id.toString(), socket.id);
};


  export const logOut = async (socket) => {
    socket.on("disconnect", async () => {
      try {
        if (socket.user) {
          connectionUser.delete(socket.user._id.toString());
          console.log(`User ${socket.user._id} disconnected and removed from map`);
        } else {
          console.log("Disconnected socket with no user info");
        }
      } catch (err) {
        console.error("Error in logOut on disconnect:", err);
      }
    });
  };


  export const getChat = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
   
    let chat = await chatModel.findOne({
      participants: {
        $all: [
          { $elemMatch: { participantId: req.user._id } },
          { $elemMatch: { participantId:new mongoose.Types.ObjectId(userId)} }
        ]
      }
    }).populate([
        {
          path: "participants.participantId",
          select: "name profileImage " // هات الاسم والصورة فقط
        },
        {
          path: "messages.senderId",
          select: "name profileImage" // هات اسم وصورة كل مرسل رسالة
        }
      ])

   if (!chat) {
    // بدل ما ترجع خطأ، رجّع ريسبونس عادي بدون شات
    return res.status(200).json({ msg: "Chat not found", chat: null });
  }

    const isParticipant = chat.participants.some(p =>
      p.participantId._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return next(new Error("Access denied"));
    }

    res.status(200).json({ msg: "done", chat });
  });
export const getAllChats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const chats = await chatModel.find({
    "participants.participantId": new mongoose.Types.ObjectId(userId)
  })
  .populate([
    {
      path: "participants.participantId",
      select: "name profileImage"
    },
    {
      path: "messages.senderId",
      select: "name profileImage"
    }
  ])
  .sort({ updatedAt: -1 }); // Sort by most recent activity
console.log("chats",chats)
  res.status(200).json({ msg: "done", chats });
});
