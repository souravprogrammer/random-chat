// const path = require("path");
import path from "path";
import { resolve as _resolve } from "path";
import nodeExternals from "webpack-node-externals";
export default {
  entry: "./app/app.js",
  mode: "production",
  target: "node",

  externals: [nodeExternals()],

  output: {
    path: path.resolve(".", "dist"),
    filename: "server.js",
    environment: {
      // Tell webpack to use ECMAScript Modules
      module: true,
    },
  },
};
