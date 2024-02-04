// const path = require("path");
import path from "path";

export default {
  entry: "./app/app.js",
  mode: "production",
  output: {
    path: path.resolve(".", "dist"),
    filename: "server.js",
  },
};
