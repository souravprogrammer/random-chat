import { ChatUserModel } from "../model/chatUser.model.js";
export default class mongoDBAdapter {
  constructor() {}
  async addUser({ id, peerId, mode, ip, name, deviceToken }) {
    const user = new ChatUserModel({
      id,
      peerId,
      lookingForPeers: false,
      connectedPeerId: null,
      busy: false,
      mode: mode,
      ip,
      deviceToken,
      name,
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
      initialValues,
      { new: false }
    );
    await ChatUserModel.updateOne(
      { id: disconnectedUser?.connectedPeerId },
      initialValues
    );
    return disconnectedUser;
  }
  async lookForRoom({ id, lastPeer, io, mode = null, user = null }) {
    const choosenPeers = await ChatUserModel.aggregate([
      { $match: { id: { $ne: id }, lookingForPeers: true, mode } },
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
      io.to(choosenPeers[0].id).emit("incoming_peer_request", user);
    } else {
      // console.log("No matching documents found.");
      // io.to(id).emit("no_active_peers_found");
    }
  }
  async addInQueue({ id, io }) {
    const user = await ChatUserModel.findOneAndUpdate(
      { id },
      { lookingForPeers: true, busy: false }
    );
    await this.lookForRoom({ id, io, mode: user?.mode, user });
  }
  async getConnections() {
    return await ChatUserModel.countDocuments();
  }
}
