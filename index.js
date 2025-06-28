import express from "express";
import dotenv from "dotenv";
import path from "path";
import bootStrap from "./src/app.controller.js";

import { runIo } from "./src/modules/chat/chat.socket.js"
import {runNotificationIo} from "./src/modules/notification/notification.socket.js"

import {createSocketServer} from "./src/socket.js"


dotenv.config({ path: path.resolve("src/config/.env") });
const app = express();
const port = process.env.PORT;
bootStrap(express, app);
const httpServer=app.listen(port,"0.0.0.0" ,() => {
  console.log(`Server is Running at ${port}`);
});
const io = createSocketServer(httpServer);

app.set("socketio", io); // Store actual instance for use in routes/controllers

runIo(io); // Pass instance
runNotificationIo(io); // Pass instance
