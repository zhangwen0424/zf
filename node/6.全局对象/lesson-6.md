## 一.Node 核心内容

在 Node.js 中，全局对象是 global 对象。全局对象上的属性可以直接访问，但是在模块中我们可以直接访问，exports、require、module、**filename、**dirname，均为函数的参数，我们可以在模块内部直接访问这些变量，但是它们并不是全局对象上的属性。

### 1.Global

在 Node.js 中，通过在变量前面加上 global 关键字来声明全局变量。通过 var 声明的变量不会挂载到全局上。全局变量可以再不同模块中进行访问。不建议在代码中使用全局变量，会污染全局环境。

### 2.Process

- process.cwd: 当前的执行工作目录
- process.platform: 平台标识 win32 和 darwin
- process.env.NODE_ENV: 环境变量，通过 cross-env 可以设置不同平台的环境变量。（终端环境变量 export NODE_ENV=XXX、系统环境变量~/.bash_profile）
- process.argv:获取用户传递的参数
- process.nextTick: Node 中的微任务

```js
let args = process.argv.slice(2).reduce((memo, current, index, array) => {
  if (current.startsWith("--")) {
    memo[current.slice(2)] = array[index + 1]
      ? array[index + 1].startsWith("--")
        ? true
        : array[index + 1]
      : true;
  }
  return memo;
}, {});
console.log(args);
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
```

第三方模块可以来实现这些功能 commander，yargs，minimist

使用案例

```js
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
```

### 3.Node 中的事件环

- 1.我们写的 js 代码会交给 v8 引擎进行处理
- 2.代码中可能会调用 nodeApi,node 会交给 libuv 库处理
- 3.libuv 通过阻塞 i/o 和多线程实现了异步 io
- 4.通过事件驱动的方式,将结果放到事件队列中,最终交给我们的应用。

本阶段执行已经被 setTimeout() 和 setInterval()的调度回调函数。
┌───────────────────────────┐
┌─>│ timers │
│ └─────────────┬─────────────┘
| 执行延迟到下一个循环迭代的 I/O 回调。
│ ┌─────────────┴─────────────┐
│ │ pending callbacks │
│ └─────────────┬─────────────┘
| 仅系统内部使用。
│ ┌─────────────┴─────────────┐
│ │ idle, prepare │
│ └─────────────┬─────────────┘  
| 检索新的 I/O 事件;执行与 I/O 相关的回调  
┌───────────────┐
│ ┌─────────────┴─────────────┐ │  
incoming: │
│ │ poll │<─────┤  
connections, │
│ └─────────────┬─────────────┘ │ data,
etc. │
│ setImmediate() 回调函数在这里执行。  
└───────────────┘
│ ┌─────────────┴─────────────┐  
│ │ check │
│ └─────────────┬─────────────┘
| 一些关闭的回调函数
│ ┌─────────────┴─────────────┐
└──┤ close callbacks │  
 └───────────────────────────┘
这里每一个阶段都对应一个事件队列,当 event loop 执行到某个阶段时会将当前阶段对应的队列依次执行。当该队列已用尽或达到回调限制，事件循环将移动到下一阶段。

process.nextTick() 从技术上讲不是事件循环的一部分。优先级高于微任务

poll 阶段:

- 1.检测 Poll 队列中是否为空，如果不为空则执行队列中的任务，直到超时或者全部执行完毕。
- 2.执行完毕后检测 setImmediate 队列是否为空，如果不为空则执行 check 阶段，如果为空则等待时间到达。时间到达后回到 timer 阶段
- 3.等待时间到达时可能会出现新的 callback，此时也在当前阶段被清空

在 Node 环境中 任务类型 相对就比浏览器环境下要复杂一些：

- microTask：微任务；
- nextTick：process.nextTick；
- timers：执行满足条件的 setTimeout 、setInterval 回调；
- I/O callbacks：是否有已完成的 I/O 操作的回调函数，来自上一轮的 poll 残留；
- poll：等待还没完成的 I/O 事件，会因 timers 和超时时间等结束等待；
- check：执行 setImmediate 的回调；
- close callbacks：关闭所有的 closing handles ，一些 onclose 事件；
- idle/prepare 等等：可忽略。

  因此，也就产生了执行事件循环相应的任务队列 Timers Queue、I/O Queue、Check Queue 和 Close Queue

  ````js
  setTimeout(() => { // 执行顺序不确定
  console.log('settimeout')
  })
  setImmediate(() => {
  console.log('check')
  })
  const fs = require('fs');
  fs.readFile('./package.json', () => { // poll阶段的下一个阶段是check
    setTimeout(() => { // timer
        console.log('settimeout')
    })
    setImmediate(() => { // check
        console.log('check')
    })
  });```
  ````

### 笔记

```js
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
```

## 4.Buffer

### 1).为什么需要 Buffer?

Buffer 对象在 Node.js 中是用来处理二进制数据的，展现形式是 16 进制。有了 Buffer 之后让 js 拥有处理二进制数据的能力。
（Blob 不能对文件进行处理，ArrayBuffer 不能直接读取二进
制数据，buffer 直接可以处理二进制数据）

### 2).进制转换

- 任意进制转换成 10 进制 采用乘权求和的方式 parseInt('0111',2)
- 10 进制转任意进制 采用反向取余的方式 (100).toString(16)
- 10 进制小数转二进制 采用乘 2 取整法的方式 (0.1).toString(2)
  思考：0.1 + 0.2 !== 0.3

### 3).字符编码

- 最早采用 ASCII，是一种 7 位的编码方式，最多支持 128 个字符（只能处理英文字符和一些常用的符号）
- GB2312 简体中文字符编码，两个字节表示（ 两个大于 127 的字符连在一起时，就表示一个汉字） 为中国而生，大概支持 6000 多个汉字。
- GBK 是 GB2312 的扩展，两个字节表示 。只要第一个字节是大于 127 就是中文的第一个字节。支持了繁体、日语、韩语等。
- GB18030 在 GB2312 和 GBK 基础上更全面
- Unicode 使用 16 位来统一表示所有的字符 （将文字全部重写重拍）
- UTF-8 对 Unicode 编码进行编码，编码成 1-4 个字节。

  结论：GB 编码中 1 个汉字是 2 个字节，在 utf8 编码中一个汉字是 3 个字节（常⻅的 ASCII 字符，使用一个字节表示）。
  node 中默认不支持 GB 编码

### 4).base64 编码

```js
console.log(Buffer.from("帅"));
console.log((0xe5).toString(2));
console.log((0xb8).toString(2));
console.log((0x85).toString(2));
// 11100101  10111000  10000101
// // 111001 011011 100010 000101   3 * 8 = 4 *6;
console.log(parseInt("111001", 2));
console.log(parseInt("011011", 2));
console.log(parseInt("100010", 2));
console.log(parseInt("000101", 2));
// 中文编码取值表
let code = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
code += code.toLowerCase();
code += "0123456789";
code += "+/";
console.log(code[57] + code[27] + code[34] + code[5]);
console.log(Buffer.from("帅").toString("base64"));
```

base64 的优缺点：Base64 是将二进制转换成文本字符串方便传输。缺点就是转换成 base64 编码的结果比以前大 1/3。

### 笔记

```js
// buffer是为了在node中来处理我们二进制数据  16进制

// blob 文件类型 ，我们不能直接动手操作这个blob
// arraryBuffer 可以存储二进制， 不能直接操作读取他
// 有个二进制数据类型来帮我们操作二进制 Buffer

const fs = require("fs");

const r = fs.readFileSync("./package.json");
console.log("r", r);

// 电脑的世界里只 0,1。 进制转化问题， 二进制的缺点长，不容易阅读
// 10进制  -> 2进制 8进制  16进制

// 1b = 8bit (每一个位都能放一个 0 , 1)
// 1024b = 1kb
// 1024kb = 1M
// 二进制0b开头  八进制0开头 十六进制 0x开头

// 111 是二进制 -》3 10进制  1x2^2 + 1x2^1 + 1*2^0 -> 7
// 111 是16进制 -》17 10进制 乘权求和   1 * 16 ^2 + 1 * 16 ^1 + 1 * 16 ^0 = 273
// 1111111111 + 1 -1 = 1 * 2 ^ 10 -1

// 1. parseInt 这个方法可以将任何进制转化成10进制
console.log(parseInt("1111111111", 2)); // 1023
console.log(parseInt("11", 8)); // 9
console.log(parseInt("11", 16)); // 17

// 2. toString 可以转换任何进制 转出来的是字符串
console.log((100).toString(16)); //10进制-》16 进制， 反向取余的方式来计算 64

// 0.1 + 0.2 !== 0.3  -> 二进制来存储  10进制的小数如何转化成2进制：乘2取整法
// 0.1 * 2 = 0.2
// 0.2 * 2 = 0.4
// 0.4 * 2 = 0.8
// 0.8 * 2 = 1.6
// 0.6 * 2 = 1.2
// 0.2 * 2 = 0.4
// 0.00011001001001001
console.log((0.1).toString(2)); // 0.0001100110011001100110011001100110011001100110011001101
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.2 + 0.2); // 0.4 都是近似值,碰巧相等

// 编码问题 发展历程
// ascii  127最大值是127(0b1111111)   11111111 + 1 -1  = 2^8 - 1 = 255 (1个字节就可以表示ascii码)
// gb2312 支持简体中文  两个字节表示我们的汉字 如果两个字节大于127 我就认为这两个组合成一个汉字 有了6000多个汉字出现了
// gbk 双字节 只要第一个字节超过了 127我就认为下一个字节就是汉字的另一个部分 繁体。
// gb18030 基于gb2312和gbk 进行了扩充  可以正常使用  半角和全角

// 一个汉字 需要两个字节
// unicode 编码  统一用两个字节来表示所有的字符 255 * 255 = 65000+
// utf组织 对unicode进行编码 编程1-4个可变长度的字节 10w+字符。 可变在utf-8一个字母是一个字节   一个汉字是3个字节
// node中默认不支持gbk

// 编码方式
// base64编码 （编码格式） 明文，按照大家都知道的规则进行的转化  `base32`
// http 文本格式的协议 将二进制进行编码传输 -》字符串

// base64的核心就是让每个字节都在64位之内, 如何控制在 64 位， base64 的原理
// 转成 base64，从三个字节变成 4 个字节，体积扩大
// 将1个文字三个字节，3 * 8 个位 = 24位
console.log(Buffer.from("帅")); // <Buffer e5 b8 85>
console.log((0xe5).toString(2)); // 11100101
console.log((0xb8).toString(2)); // 10111000
console.log((0x85).toString(2)); // 10000101
// 11100101 10111000 10000101   -》 4 * 6的格式
// 每隔六位拆分，前面补两个 0 =》 00111001  00011011  00100010  00000101
console.log(parseInt("00111001", 2)); // 57
console.log(parseInt("00011011", 2)); // 27
console.log(parseInt("00100010", 2)); // 34
console.log(parseInt("00000101", 2)); // 5

let code = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
code += code.toLowerCase();
code += "0123456789";
code += "+/";
console.log(code[57] + code[27] + code[34] + code[5]); // 5biF  3个 -》 4个  1M -》 1.3M
// webpack file-loader
console.log(Buffer.from("帅").toString("base64")); // 5biF
```
