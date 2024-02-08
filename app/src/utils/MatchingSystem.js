import AsyncLock from "async-lock";
import { ChatUserModel } from "../model/chatUser.model.js";
import MemmoryAdapter from "./MemmoryAdapter.js";
import q from "q";

// const lock = new AsyncLock({ Promise: q });

/**
 * add users on connect
 * update user on socket update looking for peer
 * update users on socket like looking for peers false and busy
 * delete users on disconnect
 */
const LOCK = "USER_LOCK";
export default class MatchingSystem {
  // lock.aquire
  // tartagy: "inMemory" / "mongoDB"

  constructor(options = { startagy: "inMemory" }) {
    this.startagy = options.startagy;
    this.adapter =
      options.startagy === "inMemory" ? new MemmoryAdapter() : null;
    this.lock = new AsyncLock({ Promise: q });
  }

  /**
   *
   * @param {string} user.id
   */
  async addUser(user) {
    this.lock.acquire(LOCK, async () => {
      this.adapter.addUser(user);
    });
    // new ChatUserModel(user);
  }
  // { id, lastPeer, io }
  async lookForRoom(data) {
    this.lock.acquire(LOCK, async () => {
      await this.adapter.lookForRoom(data);
    });
  }
  async disconenctUser(id, cb) {
    this.lock.acquire(LOCK, async () => {
      const disconenctedUser = await this.adapter.disconenctUser(id);
      cb(disconenctedUser);
    });
  }

  async addInQueue(data) {
    this.lock.acquire(LOCK, async () => {
      await this.adapter.addInQueue(data);
    });
  }
  removeUser(id, cb) {
    this.lock.acquire(LOCK, async () => {
      const removedUser = await this.adapter.removeUser(id);
      cb(removedUser);
    });
  }
  async getConnections() {
    return await this.adapter.getConnections();
  }
}
