
import chatModel, { connectionUser } from "../../DB/models/chat.model.js";
import userModel from "../../DB/models/user.model.js";
import { authSocket } from "../../middleWare/authentication.js";
import { role } from "../../utilities/Enums.js";
import mongoose from "mongoose";

export const startChat = async (socket) => {
  socket.on("startConversation", async (messageInfo) => {
    try {
      const { destId , senderRole} = messageInfo;

      // التحقق من التوثيق
      const data = await authSocket({ socket });
      console.log("user socket", data.user._id)
      if (![200, 201].includes(data.statusCode)) {
        return socket.emit("authError", data);
      } 
      const user = data.user;
      console.log("destId:", destId);
      console.log("userId:", user._id);
     
      if (destId.toString() === user._id.toString()) {
        return socket.emit("errorMessage", { message: "Cannot start a chat with yourself" });
      }
      // التحقق من وجود destId
      if (!destId) {
        return socket.emit("errorMessage", { message: "destId is required" });
      }

      // التأكد من أن الـ IDs من نوع ObjectId
      const userId = new mongoose.Types.ObjectId(user._id);
      console.log("userId", userId)
      const destinationId = new mongoose.Types.ObjectId(destId);
console.log("destId : ", destinationId)
      // جلب بيانات الطرف الآخر من قاعدة البيانات لتحديد دوره
      const destUser = await userModel.findById(destinationId).select("userType name profileImage");
      if (!destUser) {
        return socket.emit("errorMessage", { message: "Destination user not found" });
      }
      console.log("destUser", destUser)



      // التحقق من صحة الدور
      const validRoles = [role.Doctor, role.Pharmacist, role.admin, role.User];
      if (!validRoles.includes(senderRole)) {
        return socket.emit("errorMessage", { message: "Invalid destination user role" });
      }

      // البحث عن محادثة سابقة
      let chat = await chatModel.findOne({
        $and: [
          { "participants.participantId": userId, "participants.role": senderRole },
          { "participants.participantId": destinationId,"participants.role":destUser.userType  },
          { "participants.2": { $exists: false } }
        ]
      });

      // إنشاء محادثة جديدة إذا لم توجد
      if (!chat) {
        chat = await chatModel.create({
          participants: [
            { participantId:userId, role: senderRole },
            { participantId: destinationId, role: destUser.userType }
          ],
          messages: []
        });
      }
console.log("chat",chat)
      // إرسال التأكيد للمستخدم
      socket.emit("successMessage", { message: "Chat started", chatId: chat._id });

      // إرسال إشعار للطرف الآخر إن كان متصلاً
      const destSocketId = connectionUser.get(destId.toString());
      if (destSocketId) {
        socket.to(destSocketId).emit("chatStarted", {
          from: {
            _id: userId,
            role: senderRole,
            name: user.name,
            image: user.profileImage
          },
          chatId: chat._id
        });
      }

    } catch (error) {
      console.error("startConversation error:", error);
      socket.emit("errorMessage", { message: "Internal server error" });
    }
  });
};
export const sendMessage = async (socket) => {
  socket.on("sendMessage", async (messageInfo) => {
    try {
      const { destId,senderRole, message } = messageInfo;

      // تحقق من التوثيق
      const data = await authSocket({ socket });
      if (![200, 201].includes(data.statusCode)) {
        return socket.emit("authError", data);
      }
      const user = data.user;
      console.log("destId:", destId);
      console.log("userId:", user._id);

      if (destId.toString() === user._id.toString()) {
        return socket.emit("errorMessage", { message: "Cannot start a chat with yourself" });
      }
      // تحقق من وجود البيانات المطلوبة
      if (!destId || !message) {
        return socket.emit("errorMessage", { message: "destId, senderRole, and message are required" });
      }
 const userId = new mongoose.Types.ObjectId(user._id);
      const destinationId = new mongoose.Types.ObjectId(destId);
      
      const destUser = await userModel.findById(destId).select("userType name profileImage");
      if (!destUser) {
        return socket.emit("errorMessage", { message: "Destination user not found" });
      }

      // تحقق من صحة دور الطرف الآخر
      const validRoles = [role.Doctor, role.Pharmacist, role.admin, role.User];
      if (!validRoles.includes(senderRole)) {
        return socket.emit("errorMessage", { message: "Invalid senderRole" });
      }


      // حاول تجد تحديث محادثة موجودة بين الطرفين
      let chat = await chatModel.findOneAndUpdate(
        {
          $and: [
            { "participants.participantId": userId, "participants.role": senderRole },
            { "participants.participantId": destinationId,"participants.role":destUser.userType  },
            { "participants.2": { $exists: false } }
          ],
        },
        {
          $push: {
            messages: {
              senderId: userId,
              role: senderRole,
              name: user.name,
              image: user.profileImage,
              message,
              createdAt: new Date(),
            },
          },
          lastMessage: message,
          lastUpdated: new Date(),
        },
        { new: true }
      );

      let isNewChat = false;

      // إذا لم توجد محادثة، أنشئ واحدة جديدة مع الرسالة
      if (!chat) {
        chat = await chatModel.create({
          participants: [
            { participantId: userId, role: senderRole },
            { participantId: destinationId, role: destUser.userType },
          ],
          messages: [
            {
              senderId: userId,
              role: senderRole,
              name: user.name,
              image: user.profileImage,
              message,
              createdAt: new Date(),
            },
          ],
          lastMessage: message,
          lastUpdated: new Date(),
        });
        isNewChat = true;  // علم إن المحادثة جديدة
      }
      console.log("Chat saved:",chat)

      // أرسل تأكيد للمرسل أن الرسالة وصلت وتم حفظها
      socket.emit("successMessage", { message });

      // ابحث عن الـ socketId الخاص بالطرف الآخر من connectionUser map
      const destSocketId = connectionUser.get(destId.toString());

      if (destSocketId) {
        // أرسل له الرسالة الحية
        socket.to(destSocketId).emit("receiveMessage", {
          message,
          from: {
            _id: userId,
            role: senderRole,
            name: user.name,
            image: user.profileImage
          },
          chatId: chat._id,
          timestamp: new Date(),
        });
        console.log("destId",destId)
        console.log("User",userId)
console.log("destRole",destUser.userType)
        console.log("senderrole",senderRole)
        // إذا كانت المحادثة جديدة، أرسل إشعار بإنشاء محادثة جديدة للطرف الآخر
        if (isNewChat) {
          socket.to(destSocketId).emit("newChatNotification", {
            chatId: chat._id,
            from: {
              _id: userId,
              role: senderRole,
              name: user.name,
              image: user.profileImage
            },
            messagePreview: message,
          });
        }
      }

    } catch (error) {
      console.error("sendMessage error:", error);
      socket.emit("errorMessage", { message: "Internal server error" });
    }
  });
};
