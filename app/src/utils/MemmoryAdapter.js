export default class MemmoryAdapter {
  io = null;
  users = [];
  async addUser({ id, peerId, mode }) {
    this.users.push({
      id,
      peerId,
      lookingForPeers: false,
      connectedPeerId: null,
      busy: false,
      mode: mode,
    });
  }
  async removeUser(id) {
    const userIndex = this.users.findIndex((user) => user.id === id);

    // Check if the user is found
    if (userIndex !== -1) {
      const disconnectedUser = this.users[userIndex];

      this.users.splice(userIndex, 1);

      return disconnectedUser;
    }
    return null;
  }
  async disconenctUser(id) {
    const userIndex = this.users.findIndex((user) => user.id === id);

    // Check if the user is found
    if (userIndex !== -1) {
      const disconnectedUser = { ...this.users[userIndex] };

      this.users[userIndex].lookingForPeers = false;
      this.users[userIndex].busy = false;
      this.users[userIndex].connectedPeerId = null;

      // users.splice(userIndex, 1);
      const connectedPeerIndex = this.users.findIndex(
        (user) => user.id === disconnectedUser.connectedPeerId
      );
      if (connectedPeerIndex !== -1) {
        this.users[connectedPeerIndex].connectedPeerId = null;
        this.users[connectedPeerIndex].lookingForPeers = false;
        this.users[connectedPeerIndex].busy = false;
      }

      // If the user was connected to another peer, notify that peer
      return disconnectedUser;
    }
  }
  async lookForRoom({ id, lastPeer, io }) {
    const userIndexCaller = this.users.findIndex((user) => user.id === id);
    if (userIndexCaller === -1) return;
    if (this.users[userIndexCaller].busy) return;

    const avilablePeers = this.users.filter((user) => {
      return (
        user.lookingForPeers &&
        user.id !== id &&
        user.id !== lastPeer &&
        user.mode === this.users[userIndexCaller].mode
      );
    });

    // console.table("-------------avilablePeers----------- " + id);

    if (avilablePeers.length <= 0) return;
    const choosenPeer =
      avilablePeers[Math.floor(Math.random() * avilablePeers.length)];

    const choosenPeerIndex = this.users.findIndex(
      (user) => user.id === choosenPeer.id
    );
    this.users[choosenPeerIndex].busy = true;

    if (userIndexCaller !== -1 && choosenPeerIndex !== -1) {
      this.users[userIndexCaller].busy = true;
      this.users[choosenPeerIndex].busy = true;

      this.users[userIndexCaller].lookingForPeers = false;
      this.users[choosenPeerIndex].lookingForPeers = false;

      this.users[userIndexCaller].connectedPeerId = choosenPeer.id;
      this.users[choosenPeerIndex].connectedPeerId =
        this.users[userIndexCaller].id;

      io.to(id).emit("peer_matched", choosenPeer);
      io.to(choosenPeer.id).emit("incoming_peer_request");
    } else {
      // console.log("no peer");
      io.to(socket.id).emit("no_active_peers_found");
    }
  }
  async addInQueue({ id, io }) {
    const userIndexCaller = this.users.findIndex((user) => user.id === id);
    if (userIndexCaller === -1) return;

    try {
      this.users[userIndexCaller].lookingForPeers = true;
      this.users[userIndexCaller].busy = false;
      this.users[userIndexCaller].connectedPeerId = null;
      await this.lookForRoom({ id, io });
    } catch (err) {
      console.error(err.message);
    }
  }
  async getConnections() {
    return this.users?.length;
  }
}
