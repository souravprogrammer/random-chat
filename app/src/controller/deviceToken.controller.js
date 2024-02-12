import { v4 as uuidv4 } from "uuid";

async function generateDeviceToken(req, res) {
  const deviceId = uuidv4();
  try {
    const deviceToken =
      req?.query?.deviceToken === "undefined" ? null : req?.query?.deviceToken;
    if (deviceToken) {
      res.status(200).json({ message: "ok" });
      return;
    }
    res
      .status(200)
      .json({ message: "deviceToken has been set", token: deviceId });
  } catch (err) {
    res.status(500).json({ message: err.message, token: null });
  }
}

export { generateDeviceToken };
