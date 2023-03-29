const path = require("path");
const webpack = require("webpack");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  devtool: false,
  entry: "./src/index.js",
  output: {
    //当我们把生成后的bundle.js文件写入html的时候，需要添加的前缀
    publicPath: "http://localhost:3000/",
    //这个才是指定打包存放的本地路径
    path: path.resolve("dist"),
    //false就是不使用异步加载
    chunkLoading: "jsonp",
    //contentBase以有是指的是静态文件根目录，现在已经废弃，改为static
    //设path.resolve('dist')是没有必要
  },
  devServer: {
    port: 3000,
    static: path.resolve("./public"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-react",
                  //https://babeljs.io/docs/babel-preset-react#both-runtimes
                  //automatic auto imports the functions that JSX transpiles to. classic does not automatic import anything.
                  {
                    //如果想引React classic,如果不想引可以使用automatic
                    runtime: "classic",
                  },
                ],
              ],
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
    new ModuleFederationPlugin({
      filename: "remoteRemoteEntry.js", //远程的文件名
      name: "remoteKKK", //远程的名称
      exposes: {
        //要向外暴露哪些组件
        "./NewsList": "./src/NewsList", // remote/NewsLis
      },
      //指定远程的名称和访问路径
      remotes: {
        hostXXX: "hostYYY@http://localhost:8000/hostRemoteEntry.js",
      },
      shared: {
        react: {
          eager: false,
        },
        "react-dom": {
          eager: false,
        },
      },
      /*   shared:{
                react:{singleton:false,requiredVersion:'^17.2.0'},
                'react-dom':{singleton:false,requiredVersion:'^17.2.0'}
            }  */
    }),
  ],
};
