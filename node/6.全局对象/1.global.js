// 浏览器中的全局对象 window
// node中的全局对象 global , this不是global指代的是当前模块的导出对象.
// 我们默认通过var 来声明的变量会放置到window上， let不会声明到全局上
// 我们默认通过var 声明的变量不会放到global上, 如果放到global上的属性都输全局属性

// 我们一般情况下不会将变量放到global上。 通过require来引入的不会污染全局，方便复用
// global.a = 'abc'; // 链接数据库的操作，不建议操作global属性

// export module require __dirname __filename (不是全局对象上的属性)
// global.module = Module
// global.require = require

// 全局属性， 可以通过global 直接访问 （可以不再模块内被访问）
// process
// setImmediate
// setTimeout
// Buffer

// platform 平台
// cwd 当前的工作目录, 会根据执行文件的位置发生变化   尽量读取文件采用绝对路径   __dirname 不能变
// env 环境变量
// argv 获取用户参数
// nextTick

// mac ls 查看列表  dir 查看  我们查找用户的目录写入配置文件 .npmrc
// console.log(process.platform); // darwin 标识  win32 标识
// console.log(process.cwd());

// export NODE_ENV=dev, 临时的变量就是在当前的命令窗口下设置
// set NODE_ENV=dev
// cross-env

// export NODE_ENV=pro && node 1.global.js
// console.log(process.env.NODE_ENV);
// let url = ''
// if(process.env.NODE_ENV == 'dev'){
//     url = 'http://localhost:3000'
// }else{
//     url = 'http://xxx.cn'
// }

// 我们可以再系统中内置环境变量， 一般不使用
// console.log(process.env.name)

// argv 获取用户的参数
// webpack --config webpack.config.js --port 3000 --hot
// argv 前两个参数一般用不到 1） node的可执行文件 2) 当前要执行的文件
// 一般情况下参数的短写 -p 长些--port  值不用-，key得用-
// console.log(process.argv);
// const options = process.argv.slice(2).reduce((acc, current, index, array) => {
//   // console.log("arra", array);
//   if (current.startsWith("--")) {
//     acc[current.slice(2)] = array[index + 1] || true;
//   }
//   return acc;
// }, {});
// console.log(process.argv, options);
/* 
> node 1.global.js  --port 3000 --name 200

[
  '/Users/mornki/.tnvm/versions/node/v16.15.1/bin/node',
  '/Users/mornki/project/zf/node/6.全局对象/1.global.js',
  '--port',
  '3000',
  '--name',
  '200'
] { port: '3000', name: '200' }
 */

// commander   装包: cnpm i commander chalk@4

// 命令行输入：node 1.global.js  --help
const { program } = require("commander"); //用来解析process.argv
const chalk = require("chalk");
const pkg = require("./package.json");
// 修改 Usage 后面的内容
program.version(pkg.version).name("my-cli").usage("<command> [options]");

// 设置 options
program.option("--type [type]", "Choose a project type", { default: "node" });

// 设置执行的命令，可输入node 1.global.js create
program
  .command("create")
  // 选项: 短写、长写   []必传信息 <>可传信息   描述信息    默认值
  .option("-d,--directory [dir]", "set directory", process.cwd())
  .description("create project dir")
  // 命令对应的行为
  .action((args) => {
    console.log("create project", args);
  });

program
  .command("serve")
  .option("-p,--port <v>", "set port")
  .description("start serve")
  .action((args) => {
    console.log("serve", args, program.opts());
  });
// 固定的写法
program.on("--help", function () {
  console.log(
    `\r\nRun ${chalk.blueBright(
      "my-cli <command>"
    )} --help for detailed usage of given command.`
  );
});

// program.parse(process.argv); //解析命令行输入的参数

// 命令行参数 环境变量的解析。  写一些工具的时候会用到

/* 
> node 1.global.js  --help

Usage: my-cli <command> [options]

Options:
  -V, --version     output the version number
  --type [type]     Choose a project type (default: {"default":"node"})
  -h, --help        display help for command

Commands:
  create [options]  create project dir
  serve [options]   start serve
  help [command]    display help for command

Run my-cli <command> --help for detailed usage of given command.
 */

// timers 队列 用来放定时器
// poll 轮训（处理i/o的回调）
// check 处理setImmediate

// 浏览器：每执行完毕一个宏任务，会清空微任务 从node10+ 后执行机制和我们的浏览器一样  新的
// 宏任务
// 微任务：process.nextTick >  promise.then

// 主栈代码执行完毕-》会检测timer中有没有回调，全部清空后进入到下一个阶段 -》poll（有i/o的回调继续处理）-> 看有没有check,如果有就清空

// 默认如果没有check 也没有timer，代码逻辑还有没执行完的回调，此时这个线程会在poll中等待
// 如果没有timer -》 poll（有i/o的回调继续处理）-》 没有check了

// 以前的node事件环是每个阶段的宏任务都被清空了，才会执行微任务 老的

// 1> 打印：nextTick  promise
// Promise.resolve().then(() => {
//   console.log("promise");
// });

// process.nextTick(() => {
//   // 这个方法用的多一些
//   console.log("nextTick");
// });

// 2) 执行不一定
// setTimeout(()=>{
//     console.log('timeout')
// })
// setImmediate(()=>{ // 这个方法用的比较少
//     console.log('setImmediate')
// })

// 3） setImmediate  timeout
const fs = require("fs");
fs.readFile("./package.json", function () {
  // POLL -> check -> timer
  setTimeout(() => {
    console.log("timeout");
  });
  setImmediate(() => {
    console.log("setImmediate");
  });
});
