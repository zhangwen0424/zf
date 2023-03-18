const path = require("path");
const { merge } = require("webpack-merge");
const miniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");
console.log("process.env.NODE_ENV-----", process.env.NODE_ENV);
const baseConfig = {
  mode: process.env.NODE_ENV, //"development",
  devtool: "source-map",
  entry: "./src/index.js",
  externals: [
    // {
    //   jquery: {
    //     umd: "jquery",
    //     commonjs: "jquery",
    //     commonjs2: "jquery",
    //     root: "$",
    //   },
    // },
    nodeExternals(), //排除所有的第三方模块，就是把node_modules里的模块全部设置为外部模块
  ],
  output: {
    // library: "math1", // module.exports.math1 = exports
    // libraryExport: "add", // module.exports = exports.add
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{ loader: "babel-loader" }],
      },
      {
        test: /\.css$/,
        use: [miniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new miniCssExtractPlugin(),
    // 替换模块中的值
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};

module.exports = [
  merge(baseConfig, {
    output: {
      filename: "[name]-window.js",
      libraryTarget: "window",
    },
  }),
  merge(baseConfig, {
    output: {
      filename: "[name]-commonjs.js",
      libraryTarget: "commonjs2",
    },
  }),
  merge(baseConfig, {
    output: {
      filename: "[name]-umd.js",
      libraryTarget: "umd",
    },
  }),
];
