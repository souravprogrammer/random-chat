import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";

import userRoute from "../src/route/users.route.js";
import reprotRoute from "../src/route/Reprot.route.js";
import deviceIdentification from "../src/route/deviceIdentification.route.js";

const app = express();
app.use(cors());
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
