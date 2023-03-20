const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const EslintPLugin = require("eslint-webpack-plugin");
//获取环境变量
const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === "production";

module.exports = {
  mode: "development", //环境
  devtool: false,
  // entry 指定入口文件，从哪个文件开始打包，可为字符串、数组、对象(入口文件可命名，打包出来多个文件)
  // entry: "./src/index.ts",
  // entry: "./src/index.js",
  // entry: () => "./src/index.js",
  entry: {
    // // vendor: "./src/vendor.js",
    // main: {
    //   import: "./src/index.js", //指的是指定入口文件
    //   // dependOn: "vendor", //声明该入口的前置依赖，这样生成的main.js会小一点，dependOn后生称的代码会require 外部依赖
    //   // runtime: "runtime",
    // },
    // 设置该入口的runtime chunk,如果这个值不设置，那么运行时代码(require方法)会打包到bundle中
    // 如果 runtime 的名字一样，两者的 runtime 会打包到一个 runtime.js中，不一样则分开打包
    // 打包出来的代码都是 commonjs，但是浏览器不认识，需要自己实现一个 commonjs规范（require方法）
    entry1: {
      import: "./src/entry1.js",
      runtime: "runtime",
    },
    entry2: {
      import: "./src/entry2.js",
      runtime: "runtime",
    },
  },
  // entry: ["./src/entry1.js", "./src/entry2.js"], // 打包成一个文件 main.js文件中
  /* entry: {
    entry1: "./src/entry1.js",
    entry2: "./src/entry2.js",
  }, */

  // output 输出目录
  output: {
    path: path.resolve(__dirname, "dist"), //打包文件输出路径，必须为绝对路径
    filename: "[name].js",
    clean: true, //在新的打包之前清除历史文件
  },

  devServer: {
    host: "localhost", //主机名
    port: 9000, //访问端口号
    // open: true, //构建结束后自动打开浏览器预览项目
    compress: true, //启动gzip压缩
    hot: true, //启动支持模块热替换，这个内容我们后面会手写实现
    watchFiles: [
      //监听这些文件的变化，如果这些文件变化了，可以重新编译
      //如果不配置watchFiles就是监听所有的文件
      "src/**/*.js",
    ],
    //不管访问哪个路径，都会把请求重定向到index.html，交给前端路由来进行处理
    historyApiFallback: true,
    // proxy: {
    //   // "/api": "http://localhost:3000",
    //   "/api": {
    //     target: "http://localhost:3000",
    //     pathRewrite: { "^/api": "" },
    //   },
    // },
    // 没有后台服务器，自己写返回数据
    onBeforeSetupMiddleware({ app }) {
      app.get("/api/user", (req, res) => {
        res.json([{ name: "bor", id: 1 }]);
      });
    },
  },
  // 配置loader加载规则，webpack 只能处理 js, loader可以处理其他模块
  module: {
    // 处理方式
    rules: [
      // {
      //   test: /\.txt$/,
      //   type: "asset/source", // 导出资产的源代码，使用后txt文本不报错
      // },
      /* {
        test: /\.(png)$/,
        type: "asset/resource", // 生成单独的文件并导出 URL，png: file:///Users/mornki/project/zf/webpack/dist/cc97333c6f95cd9423c3.png
      },
      {
        test: /\.(jpg)$/,
        type: "asset/inline", // base64
      },
      {
        test: /\.png$/,
        type: "asset", //会输出文件和base64之间自动选择
        parser: {
          //如果图片大小小于某个阈值，则base64,大于某个阈值输出单独文件
          dataUrlCondition: {
            maxSize: 1024 * 32,
          },
        },
      }, */

      // {
      //   test: /\.png$/,
      //   use: [
      //     {
      //       loader: "responsive-loader",
      //       options: {
      //         sizes: [300, 600, 1024],
      //         adapter: require("responsive-loader/sharp"),
      //       },
      //     },
      //   ],
      // },

      //因为不是所有的图片都需要响应式,通过resourceQuery 查询特定标识打包成响应式图片
      {
        test: /\.(jpe?g|png)$/i,
        //oneOf是一个优化选项，用于提高打包的速度
        oneOf: [
          {
            //resourceQuery是一个用于匹配请求资源的URL中查询字符中
            resourceQuery: /responsize?/,
            use: [
              {
                loader: "responsive-loader",
                options: {
                  sizes: [300, 600, 1024],
                  adapter: require("responsive-loader/sharp"),
                },
              },
            ],
          },
          {
            type: "asset/resource",
          },
        ],
      },

      /* {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: "image-webpack-loader",
            options: {
              disable: !isProduction, //如果是开发环境不要压缩
              // 是否禁用图片优化和压缩
              disable: process.env.NODE_ENV === "development",
              mozjpeg: {
                progressive: true, // 是否开启渐进式JPEG，可以有效提升JPEG图片加载速度
                quality: 65, // 压缩JPEG图片的质量，取值范围为0到100，值越大质量越好但文件越大
              },
              optipng: {
                enabled: true, // 是否开启PNG图片的优化，可以有效提升PNG图片加载速度
              },
              pngquant: {
                // 压缩PNG图片的质量范围，取值范围为0到1，值越大质量越好但文件越大
                // 第一个数字表示压缩质量的下限，第二个数字表示压缩质量的上限
                quality: [0.65, 0.9],
                speed: 4, // 压缩PNG图片的速度，取值范围为1到10，值越大速度越快但质量越低
              },
              svgo: {
                plugins: [
                  // 压缩SVG图片的插件列表，这里包含removeViewBox和cleanupIDs两个插件
                  {
                    //用于删除SVG图片中的viewBox属性
                    //viewBox属性是用来指定SVG视口范围的，它的值是一个矩形框的坐标和宽高
                    removeViewBox: false,
                  },
                  {
                    //用于删除SVG图片中的无用ID属性
                    cleanupIDs: true,
                  },
                ],
              },
              gifsicle: {
                interlaced: true, // 是否开启GIF图片的隔行扫描,可以有效提升GIF图片加载速度
              },
            },
          },
        ],
      }, */

      {
        test: /\.ts$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-typescript"],
            },
          },
        ],
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"], //预设
              plugins: [
                //装饰器的插件就需要单独在这里配置
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/, //匹配的条件 一般是一个正则，用来匹配文件的路径
        // 从右往左，从下往上执行
        use: [
          //use指定的转换的方式
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          "postcss-loader",
        ],
      },
      {
        test: /\.less$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          "postcss-loader",
          "less-loader",
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html", // 生成 html的模版
      filename: "index.html", //打包后的文件名
    }),
    /* new HtmlWebpackPlugin({
      template: "./src/entry1.html", // 生成 html的模版
      filename: "entry1.html", //打包后的文件名
      chunks: ["entry1"], // 把 entry1（对应entry 入口中对象的 key） 对应的文件插入 entry1.html 文件中
    }),
    new HtmlWebpackPlugin({
      template: "./src/entry2.html", // 生成 html的模版
      filename: "entry2.html", //打包后的文件名
      chunks: ["entry2"],
    }), */

    new MiniCssExtractPlugin(),
    new EslintPLugin({
      extensions: [".js", "ts"],
    }),
  ],
};
