
import { logOut, registerAccount } from "./chat.service.js";
import { sendMessage,startChat } from "./message.service.js";



export const runIo=(io)=>{
   
    
    

    io.on("connection",async(socket)=>{
      
        await registerAccount(socket)
         await startChat(socket)
        await sendMessage(socket)
       
        await logOut(socket)

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
          });
    })
}

