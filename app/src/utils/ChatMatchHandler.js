import MatchingSystem from "./MatchingSystem.js";
import Events from "../lib/Events.js";

const matchingSystem = new MatchingSystem({ startagy: "inMemory" });

export default function ChatMatchHandler(socket, io) {
  function destroy() {
    try {
      socket.disconnect();
      socket.removeAllListeners();
      socket = null; //this will kill all event listeners working with socket
      //set some other stuffs to NULL
    } catch (err) {
      console.log("Error while trying to close connection", err.message);
    }
  }
  const peerConnect = async (data) => {
    // console.log("conenct peer");
    matchingSystem.addUser({
      id: socket.id,
      peerId: data.peerId ?? null,
      timeStamp: Date.now(),
      mode: data.mode,
    });
    const count = await matchingSystem.getConnections();
    io.emit("online", { count: count });

    // lock.acquire(LOCK_KEY, async () => {
    //   await addUser({
    //     id: socket.id,
    //     peerId: data.peerId ?? null,
    //     timeStamp: Date.now(),
    //     mode: data.mode,
    //   });
    //   io.emit("online", { count: users?.length });
    // });
  };
  const lookForPeers = async () => {
    await matchingSystem.lookForRoom({ id: socket.id, io });
    // lock.acquire(LOCK_KEY, async () => {
    //   await lookForRoom(socket.id);
    // });
  };
  const peerDisconnected = async (reason) => {
    // this action will call amnually when you look for the another peer to conenct
    await matchingSystem.disconenctUser(socket.id, (disconnectedUser) => {
      if (disconnectedUser?.connectedPeerId) {
        io.to(disconnectedUser.connectedPeerId).emit(
          "peer_disconnected",
          disconnectedUser
        );
      }
    });
  };
  const startLooking = async () => {
    // console.log("start_looking....", socket.id);
    matchingSystem.addInQueue({ id: socket.id, io });
    // lock.acquire(LOCK_KEY, async () => {
    //   await addInQueue(socket.id);
    // });
  };
  const isBusy = (data) => {
    // const user = users.find((f) => f.id === socket.id);
    // if (user.busy) {
    //   socket.emit(Events.PEER_STATUS, data);
    // } else {
    //   socket.emit(Events.PEER_STATUS);
    // }
  };
  const disconnect = async (reason) => {
    matchingSystem.removeUser(socket.id, async (disconnectedUser) => {
      if (!disconnectedUser) return;
      if (disconnectedUser.connectedPeerId) {
        io.to(disconnectedUser.connectedPeerId).emit(
          "peer_disconnected",
          disconnectedUser
        );
      }
      const count = await matchingSystem.getConnections();
      io.emit("online", { count: count });

      destroy();
    });
  };
  socket.on(Events.CONNECTPEER, peerConnect);
  // this event will call by the client while it's waiting for too long
  socket.on(Events.LOOK_FOR_PEER, lookForPeers);
  socket.on("start_looking", startLooking);
  socket.on("is_busy", isBusy);
  socket.on("peer_disconnected", peerDisconnected);
  socket.on("disconnect", disconnect);
}
