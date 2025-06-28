
import { logOut, registerAccount } from "./notification.service.js";

export const runNotificationIo=(io)=>{
    
    

    io.on("connect",async(socket)=>{
      
        registerAccount(socket)
        logOut(socket)

        socket.on("disconnection", () => {
            console.log("Client disconnected:", socket.id);
          });
    })
}