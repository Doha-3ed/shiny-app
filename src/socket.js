import { Server } from "socket.io";
import { runIo } from "./modules/chat/chat.socket.js"
import {runNotificationIo} from "./modules/notification/notification.socket.js"
 export const createSocketServer = (httpServer) => {
   const io = new Server(httpServer, {
     cors: {
       origin: "*",
       methods: ["GET", "POST"]
     }
   });
   return io;
 };