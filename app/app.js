import { app } from "./config/express.config.js";
import { createServer } from "http";
import { Server } from "socket.io";
import AsyncLock from "async-lock";
import q from "q";

import {
  addUser,
  users,
  removeUser,
  setIo,
  disconenctUser,
  lookForRoom,
  addInQueue,
} from "./src/lib/socketHandler.js";
import socketWrapper from "./src/lib/SocketWrapper.js";
import Events, { MODE } from "./src/lib/Events.js";
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
  const peerConnect = (data) => {
    // console.log("conenct peer");
    lock.acquire(LOCK_KEY, async () => {
      await addUser({
        id: socket.id,
        peerId: data.peerId ?? null,
        timeStamp: Date.now(),
        mode: data.mode,
      });
      io.emit("online", { count: users?.length });
    });
  };
  const lookForPeers = async () => {
    lock.acquire(LOCK_KEY, async () => {
      await lookForRoom(socket.id);
    });
  };

  const peerDisconnected = async (reason) => {
    // this action will call amnually when you look for the another peer to conenct

    lock.acquire(LOCK_KEY, async () => {
      const disconnectedUser = await disconenctUser(socket.id);
      if (disconnectedUser?.connectedPeerId) {
        io.to(disconnectedUser.connectedPeerId).emit(
          "peer_disconnected",
          disconnectedUser
        );
        // await lookForRoom(socket.id, disconnectedUser.connectedPeerId);
      }
    });
  };
  const startLooking = async () => {
    // console.log("start_looking....", socket.id);
    lock.acquire(LOCK_KEY, async () => {
      await addInQueue(socket.id);
    });
  };
  const isBusy = (data) => {
    const user = users.find((f) => f.id === socket.id);
    if (user.busy) {
      socket.emit(Events.PEER_STATUS, data);
    } else {
      socket.emit(Events.PEER_STATUS);
    }
  };
  const disconnect = async (reason) => {
    lock.acquire(LOCK_KEY, async () => {
      const disconnectedUser = await removeUser(socket.id);

      if (!disconnectedUser) return;
      if (disconnectedUser.connectedPeerId) {
        io.to(disconnectedUser.connectedPeerId).emit(
          "peer_disconnected",
          disconnectedUser
        );
      }
      io.emit("online", { count: users?.length });
      socket.off(Events.CONNECTPEER, peerConnect);
      // this event will call by the client while it's waiting for too long
      socket.off(Events.LOOK_FOR_PEER, lookForPeers);
      socket.off("start_looking", startLooking);
      socket.off("is_busy", isBusy);

      socket.off("peer_disconnected", peerDisconnected);
      socket.off("disconnect", disconnect);
      socket = null;
    });
  };
  socket.on(Events.CONNECTPEER, peerConnect);
  // this event will call by the client while it's waiting for too long
  socket.on(Events.LOOK_FOR_PEER, lookForPeers);
  socket.on("start_looking", startLooking);
  socket.on("is_busy", isBusy);

  socket.on("peer_disconnected", peerDisconnected);
  socket.on("disconnect", disconnect);
});
setIo(io);
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
server.listen(PORT, (err) => {
  if (err) console.log(err.message);
  console.log("server is listening on port", PORT);
});
