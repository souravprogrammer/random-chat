import { totalOnline, getlist } from "../controller/list.controller.js";
import express from "express";

const userRoute = new express.Router();

userRoute.get("/count", totalOnline);
userRoute.get("/list", getlist);

export default userRoute;
