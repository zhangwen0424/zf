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

## webpack.config.js 基本配置

名字定死

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

### 图片处理

```js
module.rules = [
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
];
```

响应式图片

```js
module.rules = [
  {
    test: /\.png$/,
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
];
```

不是所有图片都需要响应式，通过查询字符串匹配图片加载 loader

- 配置 resourceQuery 识别关键字就行响应式图片的生成，`resourceQuery: /responsize?/`，配图片地址`import responsiveImage from "./images/bgg.jpg?responsize";`，裁剪尺寸配到 options 中`sizes: [300, 600, 1024],`

- 配置 resourceQuery`resourceQuery: /sizes?/`，搭配图片地址`import responsiveImage from "./images/bgg.jpg?sizes[]=300,sizes[]=600,sizes[]=1024"`，裁剪尺寸配到 options 无需配置 sizes 会自动识别

- 需要注意图片所能裁剪的最大尺寸是图片的尺寸，案例图片要找个大的，否则只能裁剪成 sizes 中<=图片的尺寸

index.js

```js
// 响应式图片，图片所能裁剪的最大尺寸是图片的尺寸，案例图片要找个大的
// import responsiveImage from "./images/bgg.jpg?sizes[]=300,sizes[]=600,sizes[]=1024";
import responsiveImage from "./images/bgg.jpg?responsize";
console.log(responsiveImage);
let img = new Image();
img.srcset = responsiveImage.srcSet;
img.sizes = `(min-width: 1024px) 1024px, 100vw`;
document.body.appendChild(img);

let facebook = new Image();
facebook.src = require("./images/icons/facebook.png");
document.body.appendChild(facebook);

let github = new Image();
github.src = require("./images/icons/github.png");
document.body.appendChild(github);

let twitter = new Image();
twitter.src = require("./images/icons/twitter.png");
document.body.appendChild(twitter);
```

```js
module.rules = [
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
];
```

### entry 的选项

可为对象，数组，字符串

````js
entry: {
    // vendor: "./src/vendor.js",
    // main: {
    //   import: "./src/index.js", //指的是指定入口文件
    //   dependOn: "vendor", //声明该入口的前置依赖，这样生成的main.js会小一点，dependOn后生称的代码会require 外部依赖
    // },

    // 设置该入口的runtime chunk,如果这个值不设置，那么运行时代码(require方法)会打包到bundle中
    // 如果 runtime 的名字一样，两者的 runtime 会打包到一个 runtime.js中，不一样则分开打包
    // 打包出来的代码都是 commonjs，但是浏览器不认识，需要自己实现一个 commonjs规范（require方法）
    entry1: {
      import: "./src/entry1.js",
      // runtime: "runtime",
    },
    entry2: {
      import: "./src/entry2.js",
      // runtime: "runtime",
    },
  },```
````

### proxy 设置

```js
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
```

```js
// webpack 内置 express
const express = require("express");
const app = new express();

// app.get("/api/user", function (req, res) {
app.get("/user", function (req, res) {
  res.json({ name: "zw", age: 18 });
});

app.listen(3000, () => console.log("3000"));
```

启动服务器: node api.js
启动 wepback_dev_server: npm run dev

package.json

```json
"scripts": {
    "build": "cross-env NODE_ENV=production webpack",
    "dev": "cross-env NODE_ENV=development webpack serve"
  }
```

## npm 发布

- webpack-node-externals 排查 不需要打包的第三方模块
- webpack-merge 合并 webpack 配置

### 环境配置

cross-env 可以设置 node 环境中的 env
--mode 可以决定 模块源代码中的 process.env.NODE_ENV 的值
DefinePlugin 设置模块中的值

```json
  "scripts": {
    "build": "webpack",
    "build:prod": "cross-env NODE_ENV=production webpack",
    "build:dev": "cross-env NODE_ENV=development webpack"
  }
```

```js
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
```

## polyfill

webpack.config.js

```js
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
```

## sourcemap

- sourcemap 生成 sourcemap 文件
- eval 把模块代码通过 eval 进行包裹
- cheap 1.不包含列信息，2 不包含模块的 loader 的 map
- inline 把 sourcemap 信息变成 base64 字符串并内联到 main.js 中，不会生成单独的 sourcemap 文件

启动一个服务：
