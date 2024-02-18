import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";

import userRoute from "../src/route/users.route.js";
import reprotRoute from "../src/route/Reprot.route.js";
import deviceIdentification from "../src/route/deviceIdentification.route.js";
const allowedOrigins = [
  "https://www.banterz.online",
  "https://banterz.online",
  "https://banterz.vercel.app",
];
const app = express();
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("ping");
});
app.use("/user", userRoute);
app.use("/report", reprotRoute);
app.use("/device", deviceIdentification);

export { app };
export default app;
