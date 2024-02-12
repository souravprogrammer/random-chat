import { v4 as uuidv4 } from "uuid";

async function generateDeviceToken(req, res) {
  const deviceId = uuidv4();

  try {
    const deviceToken = req?.cookies?.deviceToken;
    if (deviceToken) {
      res.status(200).json({ message: "ok" });
      return;
    }

    res.cookie("deviceToken", deviceId);
    res.status(200).json({ message: "deviceToken has been set" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export { generateDeviceToken };
