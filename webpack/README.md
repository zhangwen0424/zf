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

### postcss-loader css 兼容处理

1.webpack.config.js 中添加 loader

```js
// 配置loader加载规则，webpack 只能处理 js, loader可以处理其他模块
  module: {
    // 处理方式
    rules: [
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
```

2.增加 postcss 的配置文件 postcss.config.js

```js
module.exports = {
  plugins: [
    require("autoprefixer"), //根据指定的浏览器版本自动添加所需的浏览器前缀
  ],
};
```

3.postcss 依赖于.browserslistrc

.browserslistrc

```
last 2 version
>1%
iOS 7
last 3 iOS version
```

### babel-loader js 兼容处理

- babel 是一个转换器，但是它本身只是一个转换的引擎，不知道如何转换？也不知道应该转换什么?
- 所以需要写一个一个的插件，进行转换，一般来说每个插件转换一个语法，或者说一个写法
- 配置的时候为了减少复杂度，就可以把插件进行打包，变成一个预设，配置一个预设就可以了
-

.babelrc、babel.config.js、webpack.config.js 中选一个就可以

1.通过.babelrc

```js
{
  "presets": ["@babel/preset-env"]
}
```

2.通过 babel.config.js

```js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          ie: 11,
        },
      },
    ],
  ],
};
```

3.通过 webpack.config.js

```js
module: {
  rules: [
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
  ];
}
```

### ts 转换 babel-loader

ts-loader 比较慢一般采用 babel-loader

webpack.config.js

```js
module.rules = {
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
```

### eslint 代码检查 eslint-webpack-plugin

webpack.config.js

```js
const EslintPLugin = require("eslint-webpack-plugin");
{
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html", // 生成 html的模版
      filename: "index.html", //打包后的文件名
    }),
    new MiniCssExtractPlugin(),
    new EslintPLugin({
      extensions: [".js", "ts"],
    }),
  ];
}
```

.eslintrc

```js
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["plugin:@typescript-eslint/recommended"]
}
```
