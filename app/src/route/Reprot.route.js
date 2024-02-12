import express from "express";
import { reprotUser, isBan } from "../controller/reprotUser.controller.js";
const reportRoute = new express.Router();

reportRoute.post("/", reprotUser);
reportRoute.get("/status", isBan);

export default reportRoute;
