// const path = require("path");
import path from "path";
import NodePolyfillPlugin from "node-polyfill-webpack-pluginc";
export default {
  entry: "./app/app.js",
  mode: "production",
  plugins: [new NodePolyfillPlugin()],

  output: {
    path: path.resolve(".", "dist"),
    filename: "server.js",
  },
};
