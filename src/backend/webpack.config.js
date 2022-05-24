const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: {
    ["audio-generator"]: "./lambdas/audio-generator/index.ts",
    ["text-extractor"]: "./lambdas/text-extractor/index.ts",
    ["start-task"]: "./lambdas/start-task/index.ts",
    ["notify-success"]: "./lambdas/notify-success/index.ts",
    ["handle-error"]: "./lambdas/handle-error/index.ts",
  },
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name]/index.js",
    library: {
      type: "commonjs",
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      canvas: false,
    },
  },
  mode: "production",
  plugins: [new CleanWebpackPlugin()],
  externals: {
    "utf-8-validate": "utf-8-validate",
    bufferutil: "bufferutil",
  },
};
