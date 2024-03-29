import { MODE } from "./Events.js";

let io = null;
const users = [];
async function addUser({ id, peerId, mode }) {
  users.push({
    id,
    peerId,
    lookingForPeers: false,
    connectedPeerId: null,
    busy: false,
    mode: mode,
  });
  // lookForRoom(id);
}
async function removeUser(id) {
  const userIndex = users.findIndex((user) => user.id === id);

  // Check if the user is found
  if (userIndex !== -1) {
    const disconnectedUser = users[userIndex];

    users.splice(userIndex, 1);
    // const connectedPeerIndex = users.findIndex(
    //   (user) => user.id === disconnectedUser.connectedPeerId
    // );
    // if (connectedPeerIndex !== -1) {
    //   users[connectedPeerIndex].lookingForPeers = true;
    //   users[connectedPeerIndex].busy = false;
    //   users[connectedPeerIndex].connectedPeerId = null;
    // }

    // If the user was connected to another peer, notify that peer
    return disconnectedUser;
  }
  return null;
}
async function disconenctUser(id) {
  const userIndex = users.findIndex((user) => user.id === id);

  // Check if the user is found
  if (userIndex !== -1) {
    const disconnectedUser = { ...users[userIndex] };

    users[userIndex].lookingForPeers = false;
    users[userIndex].busy = false;
    users[userIndex].connectedPeerId = null;

    // users.splice(userIndex, 1);
    const connectedPeerIndex = users.findIndex(
      (user) => user.id === disconnectedUser.connectedPeerId
    );
    if (connectedPeerIndex !== -1) {
      users[connectedPeerIndex].connectedPeerId = null;
      users[connectedPeerIndex].lookingForPeers = false;
      users[connectedPeerIndex].busy = false;
    }

    // If the user was connected to another peer, notify that peer
    return disconnectedUser;
  }
}
async function lookForRoom(id, lastPeer) {
  const userIndexCaller = users.findIndex((user) => user.id === id);
  if (userIndexCaller === -1) return;
  if (users[userIndexCaller].busy) return;

  const avilablePeers = users.filter((user) => {
    return (
      user.lookingForPeers &&
      user.id !== id &&
      user.id !== lastPeer &&
      user.mode === users[userIndexCaller].mode
    );
  });
  // console.table("-------------avilablePeers----------- " + id);

  if (avilablePeers.length <= 0) return;
  const choosenPeer =
    avilablePeers[Math.floor(Math.random() * avilablePeers.length)];

  const choosenPeerIndex = users.findIndex(
    (user) => user.id === choosenPeer.id
  );
  users[choosenPeerIndex].busy = true;

  if (userIndexCaller !== -1 && choosenPeerIndex !== -1) {
    users[userIndexCaller].busy = true;
    users[choosenPeerIndex].busy = true;

    users[userIndexCaller].lookingForPeers = false;
    users[choosenPeerIndex].lookingForPeers = false;

    users[userIndexCaller].connectedPeerId = choosenPeer.id;
    users[choosenPeerIndex].connectedPeerId = users[userIndexCaller].id;

    io.to(id).emit("peer_matched", choosenPeer);
    io.to(choosenPeer.id).emit("incoming_peer_request");
  } else {
    // console.log("no peer");
    io.to(socket.id).emit("no_active_peers_found");
  }
}
async function addInQueue(id) {
  const userIndexCaller = users.findIndex((user) => user.id === id);
  if (userIndexCaller === -1) return;

  try {
    users[userIndexCaller].lookingForPeers = true;
    users[userIndexCaller].busy = false;
    users[userIndexCaller].connectedPeerId = null;
    await lookForRoom(id);
  } catch (err) {
    console.error(err.message);
  }
}
function setIo(i) {
  io = i;
}
export {
  users,
  addUser,
  removeUser,
  setIo,
  disconenctUser,
  lookForRoom,
  addInQueue,
};
