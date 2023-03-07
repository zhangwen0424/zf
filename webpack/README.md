# 听课笔记

## 安装

1. 新建项目文件夹 webpack
2. 初始化项目 npm init -y
   生成 package.json，修改执行命令：
   "scripts": {
   "build": "webpack"
   }
3. 安装所需包
   npm install webpack webpack-cli webpack-dev-server style-loader css-loader html-webpack-plugin cross-env mini-css-extract-plugin less less-loader postcss postcss-loader autoprefixer @babel/core @babel/preset-env babel-loader typescript ts-loader @babel/preset-typescript eslint eslint-webpack-plugin eslint-config-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node @typescript-eslint/eslint-plugin --save

   vscode 插件：rm-js-comment（移除多余注释）

## webpack.config.js 名字定死

module -> 一个文件
chunk -> 一条有相关依赖模块关系的路径，是过程中的代码块
bundle -> 结果代码块，chunk 构建完成后就是 bundle=输出的文件

### css 处理流程

webpack.config.js

```js
{
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
  }
}
```

```js
//1.webpack 通过 node.js 读取 CSS 文件的内容,交给 css-loader 进行处理
let cssText = `body{
    color: red;
}`;
//2.css-loader 是一个转换函数，接收老内容，返回新内容
let cssModule = `module.exports = "
body{
    color: red;
}
"`;
//3.把上面转换后的内容交给 style-loader,返回一个新的 JS 内容

let style = document.createElement("style");
style.innerHTML = `body{
    color: red;
}`;
document.head.appendChild(style);
```

### HtmlWebpackPlugin 根据模版生成 html

loader 只在一个时间点生效，plugin 可以贯穿整个执行周期

```js
{
  entry: {
    entry1: "./src/entry1.js",
    entry2: "./src/entry2.js",
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
}

```

### devServer

```js
  devServer: {
    host: "localhost", //主机名
    port: 9000, //访问端口号
    open: true, //构建结束后自动打开浏览器预览项目
    compress: true, //启动gzip压缩
    hot: true, //启动支持模块热替换，这个内容我们后面会手写实现
    watchFiles: [
      //监听这些文件的变化，如果这些文件变化了，可以重新编译
      //如果不配置watchFiles就是监听所有的文件
      "src/**/*.js",
    ],
    //不管访问哪个路径，都会把请求重定向到index.html，交给前端路由来进行处理
    historyApiFallback: true,
  }
```

### cross-env 设置环境变量

- 打包环境其实主要分为二种，一种是开发环境，一种是生产环境
- 开发环境需要尽可能的打包快一点
- 生产环境打包可以慢一点

- cross-env NODE_ENV=production
- 通过 cross-env 可以跨平台设置环境变量

package.json

```js
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack",
    "dev": "cross-env NODE_ENV=development webpack serve"
  }

```

### MiniCssExtractPlugin 将 css 从 main.js 中抽离为一个单独的文件

- MiniCssExtractPlugin
- 1.把 CSS 文件提取到单独的文件中
- 1.减少了 main.js 文件体积
- 2.可以让 CSS 和 JS 并行加载，提高了加载效率，减少了加载时间
- 3.可以单独维护 CSS，更清晰

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === "production";
{
  module: {
    // 处理方式
    rules: [
      {
        test: /\.css$/, //匹配的条件 一般是一个正则，用来匹配文件的路径
        // 从右往左，从下往上执行
        use: [
          //use指定的转换的方式
          // "style-loader",
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
        ],
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin(),
  ],
}
```

### less 处理

```js
  module: {
    // 处理方式
    rules: [
      {
        test: /\.less$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          "less-loader",
        ],
      },
    ],
  }

```

### postcss-loader
