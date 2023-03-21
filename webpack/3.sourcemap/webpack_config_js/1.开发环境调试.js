const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const FileManagerWebpackPlugin = require("filemanager-webpack-plugin");
const baseConfig = {
  mode: "development",
  // devtool: "hidden-source-map",
  devtool: false,
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
    //自己生成sourcemap
    //SourceMapDevToolPlugin是一个内置插件，可以更加精细的控制sourcemap的生成
    new webpack.SourceMapDevToolPlugin({
      filename: "[file].map",
      // 是否向打包后的文件中追加 .map 地址链接
      append: "\n//# sourceMappingURL=http://127.0.0.1:8081/[url]",
      // append: false,
    }),
    // 文件读写插件
    new FileManagerWebpackPlugin({
      events: {
        onStart: {
          delete: [path.resolve("./sourcemaps")],
        },
        onEnd: {
          // 编译结束后走里面的代码
          copy: [
            // 将目标文件 copy 到指定文件夹
            {
              source: "./dist/*.map",
              destination: path.resolve("./sourcemaps"),
            },
          ],
          // copy完成后删除原来生成的 .map 文件
          delete: ["./dist/*.map"],
        },
      },
    }),
  ],
};
module.exports = baseConfig;
