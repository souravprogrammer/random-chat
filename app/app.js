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
} from "./src/lib/queue.js";
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
  socket.on(Events.CONNECTPEER, (data) => {
    console.log("conenct peer");

    lock.acquire(LOCK_KEY, async () => {
      await addUser({
        id: socket.id,
        peerId: data.peerId ?? null,
        timeStamp: Date.now(),
        mode: data.mode,
      });
    });
    // addUser({
    //   id: socket.id,
    //   peerId: data.peerId ?? null,
    //   timeStamp: Date.now(),
    // });
    console.log("conenct");
  });
  // this event will call by the client while it's waiting for too long
  socket.on(Events.LOOK_FOR_PEER, async () => {
    lock.acquire(LOCK_KEY, async () => {
      await lookForRoom(socket.id);
    });
  });

  socket.on("disconnect", async (reason) => {
    lock.acquire(LOCK_KEY, async () => {
      const disconnectedUser = await removeUser(socket.id);

      if (!disconnectedUser) return;
      if (disconnectedUser.connectedPeerId) {
        io.to(disconnectedUser.connectedPeerId).emit(
          "peer_disconnected",
          disconnectedUser
        );
        // looking for the peer after user is disconnected
        //id , last-peerId
        // await lookForRoom(disconnectedUser.connectedPeerId, socket.id);
      }
    });
  });
  socket.on("is_busy", (data) => {
    const user = users.find((f) => f.id === socket.id);
    if (user.busy) {
      socket.emit(Events.PEER_STATUS, data);
    } else {
      socket.emit(Events.PEER_STATUS);
    }
  });
  socket.on("peer_disconnected", (reason) => {
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
  });
  socket.on("start_looking", async () => {
    console.log("start_looking....", socket.id);
    lock.acquire(LOCK_KEY, async () => {
      await addInQueue(socket.id);
    });
  });
});
setIo(io);
setInterval(() => {
  console.log(
    "--------------------------------connected users START--------------------------------"
  );
  console.table(users);
  console.log(
    "--------------------------------connected users END --------------------------------"
  );
}, 5000);

server.listen(PORT, (err) => {
  if (err) console.log(err.message);
  console.log("server is listening on port", PORT);
});
