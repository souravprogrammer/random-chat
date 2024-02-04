import express from "express";
import cors from "cors";
import userRoute from "../src/route/users.route.js";
const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("ping");
});
app.use("/user", userRoute);

export { app };
export default app;
