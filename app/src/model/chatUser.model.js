import mongoose from "mongoose";

// collection for only conencted user
const ChatUserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String },
    peerId: { type: String, required: true, unique: true },
    lookingForPeers: { type: Boolean, required: true },
    busy: { type: Boolean, required: true },
    mode: { type: String, required: true },
    connectedPeerId: { type: String, default: null },
    ip: { type: String },
    deviceToken: { type: String },
    created: { type: Date, default: Date.now }, // Field to track document creation time
  },
  { timestamps: true }
);
ChatUserSchema.index({ created: 1 }, { expireAfterSeconds: 3600 });
export const ChatUserModel = mongoose.model("chatUser", ChatUserSchema);
