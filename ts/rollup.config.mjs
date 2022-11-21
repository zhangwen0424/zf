import ts from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import path from "path";
import { fileURLToPath } from "url";

// webpack适用于打包图片文件等，这里使用 rollup
export default {
  input: "./src/index.ts", //入口
  //出口
  output: {
    file: "./dist/bundle.js", //打包的文件名字
    format: "iife", // 打包出来的结果是一个自执行函数
    sourcemap: true, //生成 sourcemap文件用于调试，需要 tsconfig.json中 sourcemap 改为 true
  },
  plugins: [
    nodeResolve({
      extensions: [".js", ".ts"], // 解析文件的格式
    }),
    ts({
      // path.resolve 是根据执行命令的位置解析出的绝对路径
      // 不可以用__dirname解析丼，因为 mjs 中没有__dirname
      // tsconfig: path.resolve(__dirname, "tsconfig.json"), //报错： __dirname is not defined in ES module

      // 这里可以采用url的方式产生绝对路径
      // import.meta.url 指代的是当前运行命令的路径
      // fileURLToPath 用你的文件 +  运行命令的路径   = 绝对路径 url中的方法
      tsconfig: fileURLToPath(new URL("tsconfig.json", import.meta.url)),
    }),
    serve({
      open: false, //打开一个页面
      openPage: "/public/index.html", //打开页面地址
      port: 3333, //打开页面的端口号
    }),
  ],
};
