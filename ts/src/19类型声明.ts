// 类型声明
// 我们编写的类型 在最终编译的时候都会被删除， 为了让别人拥有代码提示。 用ts写的代码打包后可以生成声明文件

// 1.我下载了一个早期的非ts的包，在我的项目中用就报错了
// 2.我们通过CDN引入的包
// 3.引入了一个不是ts的文件 .vue .md .png .css
// 4.我想去再全局上扩展的属性使用
// 解决方法：自己编写声明文件

// 声明类型声明的方式 declare 这都是类型，相当于告诉vscode 别报错了
// 声明文件不要放在业务代码中，统一管理，.d.ts

// console.log(Seasons.Spring);
// console.log(sum);// 报错
// let person: Person = {
//   a: "abc",
// };
// console.log(person);
// $(".box").height(300).width(100);
// $.ajax("/login", { method: "get" });
// $.fn.extend({});

import mitt from "mitt"; // 导入模块
import type { Listener } from "mitt"; // 导入类型

let fn: Listener = function (...args) {
  console.log("args:", args);
};
mitt.on("data", fn);
mitt.emit("data", "a", "b");
mitt.zoo;

import url from "1.jpg";

// import $ from "jquery";
// import bt from "is-builtin-module";

// 配置 tsconfig.json 中 "moduleResolution": "node"
// 默认查找第三方类型 会先查找当前同名的包node_modules下面有没有 package.json > types 有就采用制定的问题
// 如果没有types 就查找 当前包有没有index.d.ts，如果没有继续查找
// 查找当前@types 目录下是否有此模块，找对应的同名的文件夹下的声明文件. 如果没有对应的包会按照你配置的解析规范查找

// npm install jquery  找不到对应模块
// npm install @types/jquery  可在@types 中找到对应模块

// 如果没有 就会提示报错，你可以自己编写类型
// 想指定ts的查找路径 可以使用 types字段 (指定后先找自己的再找第三方的)
// import _ from "lodash";
// _.a();

// 三斜线指令：/// <reference path="./lodash.d.ts"/>
// 1) path 引入自己的声明，给路径
// 2) types 依赖的第三方模块
// 3） lib ts内置的类型声明 放到页面顶部才能正常使用

// export as namespace _;//把这个命名空间变成全局变量，不需要引入

String.prototype.double;
window.a;

// export {};
