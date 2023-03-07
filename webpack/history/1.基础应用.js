const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "development", //环境

  // entry 指定入口文件，从哪个文件开始打包，可为字符串、数组、对象(入口文件可命名，打包出来多个文件)
  // entry: "./src/index.js",
  // entry: ["./src/entry1.js", "./src/entry2.js"], // 打包成一个文件 main.js文件中
  entry: {
    entry1: "./src/entry1.js",
    entry2: "./src/entry2.js",
  },

  // output 输出目录
  output: {
    path: path.resolve(__dirname, "dist"), //打包文件输出路径，必须为绝对路径
    filename: "[name].js",
    clean: true, //在新的打包之前清除历史文件
  },

  // 配置loader加载规则，webpack 只能处理 js, loader可以处理其他模块
  module: {
    // 处理方式
    rules: [
      {
        test: /\.css$/, //匹配的条件 一般是一个正则，用来匹配文件的路径
        // 从右往左，从下往上执行
        use: [
          //use指定的转换的方式
          "style-loader",
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/entry1.html", // 生成 html的模版
      filename: "entry1.html", //打包后的文件名
      chunks: ["entry1"], // 把 entry1（对应entry 入口中对象的 key） 对应的文件插入 entry1.html 文件中
    }),
    new HtmlWebpackPlugin({
      template: "./src/entry2.html", // 生成 html的模版
      filename: "entry2.html", //打包后的文件名
      chunks: ["entry2"],
    }),
  ],
};
