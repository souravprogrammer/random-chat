// 通用事件名称
const Events = {
  COUNT: "count",
  LEFT: "left",
  CLOSE: "close",
  CONNECTPEER: "connectPeeer",
  PEER_STATUS: "peer_status",
  LOOK_FOR_PEER: "look_for_peer",
};

export const MODE = Object.freeze({
  TEXT: "text",
  VIDEO: "video",
});

export default Object.freeze(Events);
