import { ChatUserModel } from "../model/chatUser.model.js";
export default class mongoDBAdapter {
  constructor() {}
  async addUser({ id, peerId, mode, ip }) {
    const user = new ChatUserModel({
      id,
      peerId,
      lookingForPeers: false,
      connectedPeerId: null,
      busy: false,
      mode: mode,
      ip,
    });
    await user.save();
  }
  async removeUser(id) {
    return await ChatUserModel.findOneAndDelete({ id: id });
  }
  async disconenctUser(id) {
    const initialValues = {
      lookingForPeers: false,
      busy: false,
      connectedPeerId: null,
    };

    const disconnectedUser = await ChatUserModel.findOneAndUpdate(
      { id },
      initialValues
    );
    await ChatUserModel.updateOne(
      { id: disconnectedUser.connectedPeerId },
      initialValues
    );
    return disconnectedUser;
  }
  async lookForRoom({ id, lastPeer, io }) {
    const choosenPeers = await ChatUserModel.aggregate([
      { $match: { id: { $ne: id }, lookingForPeers: true } },
      { $sample: { size: 1 } },
    ]);

    if (choosenPeers.length > 0) {
      const updates = [
        {
          updateOne: {
            filter: { id: choosenPeers[0].id },
            update: {
              $set: {
                busy: true,
                lookingForPeers: false,
                connectedPeerId: id,
              },
            },
          },
        },
        {
          updateOne: {
            filter: { id: id },
            update: {
              $set: {
                busy: true,
                lookingForPeers: false,
                connectedPeerId: choosenPeers[0].id,
              },
            },
          },
        },
      ];
      await ChatUserModel.bulkWrite(updates, { ordered: false });

      io.to(id).emit("peer_matched", choosenPeers[0]);
      io.to(choosenPeers[0].id).emit("incoming_peer_request");
    } else {
      console.log("No matching documents found.");
      io.to(id).emit("no_active_peers_found");
    }
  }
  async addInQueue({ id, io }) {
    await ChatUserModel.findOneAndUpdate(
      { id },
      { lookingForPeers: true, busy: false }
    );
    await this.lookForRoom({ id, io });
  }
  async getConnections() {
    return await ChatUserModel.countDocuments();
  }
}
