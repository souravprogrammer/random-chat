// import { users } from "../lib/socketHandler.js";
import { ChatUserModel } from "../model/chatUser.model.js";
async function getlist(req, res) {
  const users = await ChatUserModel.find({});
  res.json({ connectedUsers: users, message: "total connected users" });
}

async function totalOnline(req, res) {
  const count = await ChatUserModel.countDocuments({});

  res.json({ count: count, message: "total online users" });
}

export { getlist, totalOnline };
