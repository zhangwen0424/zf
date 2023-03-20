const path = require("path");
const { merge } = require("webpack-merge");
const miniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");
const baseConfig = {
  mode: "development",
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    // library: "math1", // module.exports.math1 = exports
    // libraryExport: "add", // module.exports = exports.add
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
              // 1.useBuiltIns: false 不引入 polyfill
              // 2.useBuiltIns: "entry" 在入口处根据浏览器兼容性引入所有的 polyfill
              // 2.useBuiltIns: "usage" 以你的使用情况自动引入 polyfill
              /* 
              // index.js写import "@babel/polyfill";会全部引入，不管配置
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: false, //如果开发的是类库，不要使用污染全局环境的polyfill
                  },
                ],
              ], */
              /* 
              // 根据 浏览器兼容性引入 polyfile
              // index.js中引入 import "core-js/stable"; import "regenerator-runtime/runtime";
              targets: { browsers: [">5%"] },
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "entry",
                    corejs: 3,
                  },
                ],
              ], */
              /* // 按需引入
              targets: { browsers: [">0.1%"] },
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage", //实现polyfill 因为开发项目不用担心会污染全局作用域
                    corejs: 3,
                  },
                ],
              ], */

              // 最佳实践：开发环境
              /* presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage", //实现polyfill 因为开发项目不用担心会污染全局作用域
                    corejs: { version: 3 },
                  },
                ],
              ],
              plugins: [
                [
                  "@babel/plugin-transform-runtime",
                  {
                    corejs: false, //不使用此插件提供的polyfill
                    helpers: true, //使用此插件,复用帮助 方法，减少文件体积
                    regenerator: false,
                  },
                ],
              ], */
              // 最佳实践：类库环境
              targets: {
                browsers: [">0.1%"],
              },
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: false, //如果开发的是类库，不要使用污染全局环境的polyfill
                  },
                ],
              ],
              plugins: [
                [
                  "@babel/plugin-transform-runtime",
                  {
                    corejs: 3, //使用此插件提供的polyfill,此插件不会污染全局环境
                    helpers: true, //使用此插件,复用帮助 方法，减少文件体积
                    regenerator: false,
                  },
                ],
              ],
            },
          },
        ],
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
    // new webpack.DefinePlugin({
    //   "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    // }),
  ],
};
module.exports = baseConfig;
/* module.exports = [
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
]; */
