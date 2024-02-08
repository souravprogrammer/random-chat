import mongoose from "mongoose";

// collection for only conencted user
const ChatUserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    peerId: { type: String, required: true, unique: true },
    lookingFor: { type: String, required: true },
    lookingForPeers: { type: String, required: true },
    isBusy: { type: String, required: true },
    mode: { type: String, required: true },
  },
  { timestamps: true }
);

export const ChatUserModel = mongoose.model("chatUser", ChatUserSchema);
