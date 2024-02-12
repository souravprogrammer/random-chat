import MatchingSystem from "./MatchingSystem.js";
import Events from "../lib/Events.js";
import repotedUSer from "./reportStatus.js";
// const matchingSystem = new MatchingSystem({ startagy: "inMemory" });
const matchingSystem = new MatchingSystem({ startagy: "mongoDB" });

let count = 0;
export default function ChatMatchHandler(socket, io) {
  function destroy() {
    try {
      socket.disconnect();
      socket.removeAllListeners();
      // socket = null; //this will kill all event listeners working with socket
      // //set some other stuffs to NULL
    } catch (err) {
      console.log("Error while trying to close connection", err.message);
    }
  }
  const peerConnect = async (data) => {
    const status = await repotedUSer({ deviceToken: data.deviceToken });
    if (status) {
      io.emit("report", { reportRecived: true });
      return;
    }
    await matchingSystem.addUser({
      id: socket.id,
      peerId: data.peerId ?? null,
      mode: data.mode,
      ip: socket?.handshake?.address,
      name: data.name,
      deviceToken: data.deviceToken,
    });

    count = count + 1;
    io.emit("online", { count: count });
  };
  const lookForPeers = async () => {
    await matchingSystem.lookForRoom({ id: socket.id, io });
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

  const disconnect = async (reason) => {
    matchingSystem.removeUser(socket.id, async (disconnectedUser) => {
      if (!disconnectedUser) return;
      if (disconnectedUser.connectedPeerId) {
        io.to(disconnectedUser.connectedPeerId).emit(
          "peer_disconnected",
          disconnectedUser
        );
      }
      count = count - 1;
      io.emit("online", { count: count });

      destroy();
    });
  };
  // this event will call by the client while it's waiting for too long
  // socket.on(Events.LOOK_FOR_PEER, lookForPeers);
  // socket.on("is_busy", isBusy);
  socket.on(Events.CONNECTPEER, peerConnect);
  socket.on("start_looking", startLooking);
  socket.on("peer_disconnected", peerDisconnected);
  socket.on("disconnect", disconnect);
}
