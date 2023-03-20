const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const baseConfig = {
  mode: "development",
  devtool: "eval-source-map",
  entry: "./src/index.js",
  output: {
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};
module.exports = baseConfig;
