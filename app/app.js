import { app } from "./config/express.config.js";
import AppConfig from "./config/app.config.js";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import q from "q";
import AsyncLock from "async-lock";

import {
  addUser,
  users,
  removeUser,
  setIo,
  disconenctUser,
  lookForRoom,
  addInQueue,
} from "./src/lib/socketHandler.js";
import Events, { MODE } from "./src/lib/Events.js";
import ChatMatchHandler from "./src/utils/ChatMatchHandler.js";

const LOCK_KEY = "USERS";
const lock = new AsyncLock({ Promise: q });
const PORT = process.env.PORT || 9000;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  ChatMatchHandler(socket, io);
});
setIo(io);
async function start(server) {
  try {
    await mongoose.connect(AppConfig.DB_URL);
    await server.listen(PORT, (err) => {
      if (err) console.log(err.message);
      console.log("server is listening on port", PORT);
    });
    console.log("Database Connected...");
  } catch (err) {
    console.log("Database Error", err.message, AppConfig.DB_URL);
  }
}
start(server);
// setInterval(() => {
//   console.log(
//     "--------------------------------connected users START--------------------------------"
//   );
//   console.table(users);
//   console.log(
//     "--------------------------------connected users END --------------------------------"
//   );
// }, 5000);

// function bytesToMB(bytes) {
//   return bytes / (1024 * 1024);
// }
// setInterval(() => {
//   const memoryUsage = process.memoryUsage();
//   console.log(`Memory usage:
//         RSS: ${bytesToMB(memoryUsage.rss)} MB,
//         Heap Total: ${bytesToMB(memoryUsage.heapTotal)} MB,
//         Heap Used: ${bytesToMB(memoryUsage.heapUsed)} MB,
//         External: ${bytesToMB(memoryUsage.external)} MB`);
// }, 5000);
// server.listen(PORT, (err) => {
//   if (err) console.log(err.message);
//   console.log("server is listening on port", PORT);
// });
