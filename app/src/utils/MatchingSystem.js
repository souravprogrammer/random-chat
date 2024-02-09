import AsyncLock from "async-lock";
import MemmoryAdapter from "./MemmoryAdapter.js";
import MongoDBAdapter from "./MongoDBAdapter.js";

/**
 * add users on connect
 * update user on socket update looking for peer
 * update users on socket like looking for peers false and busy
 * delete users on disconnect
 */
const lockMode = {
  ADD_USER: "ADD_USER",
  DELETE_USER: "DELETE_USER",
  LOOKING_MATCH: "LOOKING_MATCH",
  DISCONNECT_USER: "DISCONNECT_USER",
};
export default class MatchingSystem {
  // lock.aquire
  // tartagy: "inMemory" / "mongoDB"

  constructor(options = { startagy: "inMemory" }) {
    this.startagy = options.startagy;
    this.adapter =
      options.startagy === "inMemory"
        ? new MemmoryAdapter()
        : new MongoDBAdapter();
    this.lock = new AsyncLock();
  }

  /**
   *
   * @param {string} user.id
   */
  async addUser(user) {
    this.lock.acquire(lockMode.ADD_USER, async (done) => {
      try {
        await this.adapter.addUser(user);
      } catch (err) {
        console.log("addUser ", err.message);
      } finally {
        done();
      }
    });
  }
  // { id, lastPeer, io }
  async lookForRoom(data) {
    this.lock.acquire(lockMode.LOOKING_MATCH, async (done) => {
      try {
        await this.adapter.lookForRoom(data);
      } catch (err) {
        console.log("lookroom ", err.message);
      } finally {
        done();
      }
    });
  }
  async disconenctUser(id, cb) {
    this.lock.acquire(lockMode.DISCONNECT_USER, async (done) => {
      try {
        const disconenctedUser = await this.adapter.disconenctUser(id);
        await cb(disconenctedUser);
      } catch (err) {
        console.log("disconenctedUser ", err.message);
      } finally {
        done();
      }
    });
  }

  async addInQueue(data) {
    this.lock.acquire(lockMode.LOOKING_MATCH, async (done) => {
      try {
        // console.log("add Que", data.id);
        await this.adapter.addInQueue(data);
        // console.log("add Que end", data.id);
      } catch (err) {
        console.log("addInQueue ", err.message);
      } finally {
        done();
      }
    });
  }
  removeUser(id, cb) {
    this.lock.acquire(lockMode.DELETE_USER, async (done) => {
      try {
        const removedUser = await this.adapter.removeUser(id);
        await cb(removedUser);
      } catch (err) {
        console.log("removeUser ", err.message);
      } finally {
        done();
      }
    });
  }
  async getConnections() {
    return await this.adapter.getConnections();
  }
}
