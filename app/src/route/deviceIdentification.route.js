generateDeviceToken;
import express from "express";
import { generateDeviceToken } from "../controller/deviceToken.controller.js";
const reportRoute = new express.Router();

reportRoute.get("/", generateDeviceToken);

export default generateDeviceToken;
