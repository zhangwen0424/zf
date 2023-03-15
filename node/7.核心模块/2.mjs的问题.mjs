/*
const path = require('path');
// resolve 特点：返回绝对路径，但是如果你传递是一个相对路径，会根据用户执行的位置来转换成绝对路径 process.cwd()
console.log(path.resolve(__dirname,'./test.txt'))
console.log(path.resolve('./test.txt'))

// 如果要的是当前某个文件的绝对路径 一定要添加 __dirname,否则拿到的就不是真正的文件路径
__dirname 默认node中通过模块使用的时候 给函数添加的参数
*/

// esModule 在node12+版本后才支持
import path from "path"; // mjs -> esModule 在node中是自己实现的模块加载器，本质上就是给每个模块增加了（作用域）立即执行函数
console.log(import.meta.url); // file:///Users/mornki/project/zf/node/7.%E6%A0%B8%E5%BF%83%E6%A8%A1%E5%9D%97/2.mjs%E7%9A%84%E9%97%AE%E9%A2%98.mjs
import url from "url";
const obj = url.parse(import.meta.url); // 将执行目录解析成对象
console.log(obj.pathname); // /Users/mornki/project/zf/node/7.%E6%A0%B8%E5%BF%83%E6%A8%A1%E5%9D%97/2.mjs%E7%9A%84%E9%97%AE%E9%A2%98.mjs

let dirname = path.dirname(obj.pathname);
console.log(dirname); // /Users/mornki/project/zf/node/7.%E6%A0%B8%E5%BF%83%E6%A8%A1%E5%9D%97
