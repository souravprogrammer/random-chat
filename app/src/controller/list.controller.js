import { users } from "../lib/socketHandler.js";

function getlist(req, res) {
  res.json({ connectedUsers: users, message: "total connected users" });
}

function totalOnline(req, res) {
  res.json({ count: users?.length, message: "total online users" });
}

export { getlist, totalOnline };
