// 模块  es6 module

// 模块的特点 如果你在当前文件夹下 写了 import export 这个时候会产生一个独立的作用域

// 在ts中除了 import 和 export之外还有一个 兼容 commonjs规范 amd规范
// 打包 amd 需要给定 files, tsconfig.json 中配置： "module": "AMD",  "files": ["./src/index.ts"]，rollup 默认只能打包 es6模块
// 打包 commjs, tsconfig.json 中配置： "module": "CommonJS"

// const a = require("./module/a");
// import a from "./module/a";
// import a = require("./module/a"); // 大部分都采用es6语法

// export = "zw" 等价于 export default "zw"

// es6中的模块语法 在ts中都可以使用。

// 外部模块
// 内部模块 namespace 命名空间 -> 自执行函数

// 命名空间中声明的变量或者方法、类都需要导出才能使用.虽然命名空不导出 代码不报错但是无法运行
/* namespace Zoo {
  export class Dog {}
}
namespace Home {
  class Dog {}
}
Zoo.Dog;
// Home.Dog; //报错 */

import { Zoo } from "./module/a";
console.log(Zoo.Dog);

// export {};
