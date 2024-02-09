import { app } from "./config/express.config.js";
import AppConfig from "./config/app.config.js";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import ChatMatchHandler from "./src/utils/ChatMatchHandler.js";
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
