import { Server } from "socket.io";
import app from "./express.config.js";
const io = new Server(app);
export default io;
