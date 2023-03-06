## 一.浏览器事件环

### 1.什么是进程

进程是系统进行资源分配和调度的基本的单位。多个进程之间是独立的，相互隔离的，因此一个进程的挂掉不会影响其他进程。

浏览器采用的就是多进程模型

- 每个网⻚运行在自己的进程中，如果一个网⻚发生故障，只会影响该网⻚，而不会对整个浏览器造成影响。
- 每个网⻚都在它自己的隔离环境中运行，因此不同网⻚之间的代码不能相互访问。

### 2.浏览器中进程的组成

- 浏览器主进程 （管理浏览器的整体界面）
- 渲染进程 （每个⻚面一个，负责呈现⻚面内容及响应用户交互）
- 网络进程 （加载资源的进程）
- 插件进程（独立的进程）
- GPU 绘图进程 (通过 GPU 来处理图形渲染和图形处理的过程)
- ...

### 3.渲染进程

- js 引擎线程 （执行 js 代码）
- 渲染线程 （渲染⻚面、布局、画⻚面）
- 网络线程（处理⻚面的网络请求）
- GPU 线程 （使用 GPU 进行图形渲染）
- 合成线程（将多个图层合并为单个图像）
- 事件触发线程 （调度任务）

  在 js 执行的过程中还会创建一些其他的线程 （定时器、http 请求、事件）

### 4.异步任务划分

- 宏任务： 脚本的执行、ui 渲染、定时器、http 请求、事件处理（用户操作）、MessageChannel(消息通道)、setImmediate(IE 特有)、 setTimeout、i/o
- 微任务： 原生的 promise.then、mutationObserver(h5 提供的 api)、node 中的（process.nextTick）、queueMicrotask
  requestFrameAnimation 、requestIDleCallback （这两个方法是根渲染相关的，不应该算事件环的一部分）

  - (浏览器刷新频率 16.6ms)
  - 到达渲染时机后 帧执行之前 requestFrameAnimation 方法
  - 一针执行完毕后剩余的时间 requestIDleCallback （回调）

  通常浏览器会实现一个单独的宏任务队列，包含所有需要在主线程上完成的任务。宏任务队列中的任务在执行完成后，会检查是否存在微任务队列，如果存在，则按顺序执行该队列中的任务。

  - 主线程代码执行完毕后，会查找所有的微任务将其执行并且清空， 如果微任务嵌套会将生成的新的微任务放到本次队列的后面。
  - 微任务执行完毕后，要检测"是否需要"渲染，浏览器有自己的刷新频率。 渲染一定是在宏任务之前做的。
  - 在去宏任务队列中取出一个宏任务继续执行此流程。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <div id="abc"></div>
    <script>
      // 异步， 当 dom 发生变化后调用回调，应用场景：滚动刷新
      let observer = new MutationObserver(() => {
        // 回调异步的
        console.log("abc:", abc.children.length);
      });
      observer.observe(abc, {
        childList: true, // 监控儿子列表
        // characterData: true, //监控文本变更
      });

      for (let i = 0; i < 20; i++) {
        abc.appendChild(document.createElement("p"));
      }
      for (let i = 0; i < 20; i++) {
        abc.appendChild(document.createElement("p"));
      }

      // 消息通道
      const channel = new MessageChannel();
      // channel: {port1:{onmessage:...,postMessage:...}, port2:{onmessage:...,postMessage:...}}
      channel.port1.onmessage = function (e) {
        // nextTick
        console.log(e.data);
      };
      console.log(1);
      channel.port2.postMessage("abc");
      console.log(2);

      /* 打印结果
        1
        2
        abc:40
        abc 
      */
    </script>
  </body>
</html>
```

```js
// document.body.style.background = "red";
// console.log(1);
// setTimeout(() => {
//   console.log(2); // 页面渲染只有达到16.6ms 才会渲染，浏览器有合并机制
//   document.body.style.background = "yellow";
// });
// console.log(3);
// 1 3 2

// 我们的逻辑希望是异步的，但是不希望多次渲染，可以放到微任务里面，此时可以采用Promise.then
// 想让触发浏览的渲染 setTimeout(()=>{})  transiton, 触发浏览器的回流、重绘

// 不是绑定事件就放到队列中，而是点的时候，时间到了，ajax成功了才放
button.addEventListener("click", () => {
  console.log("listener1");
  Promise.resolve().then(() => console.log("micro task1"));
});
button.addEventListener("click", () => {
  console.log("listener2");
  Promise.resolve().then(() => console.log("micro task2"));
});
//  1. 默认的输出  和点击后的输出
button.click(); //立即执行，直接调用 click1() click2() 不会产生对应的宏任务，是在主线程中执行的
/*  打印结果：
        listener1
        listener2
        micro task1
        micro task2
       */

// 2.点击的话： 默认会产生两个宏任务，依次执行
/*  打印结果：
        listener1
        micro task1
        listener2
        micro task2
       */

Promise.resolve().then(() => {
  console.log("Promise1");
  setTimeout(() => {
    console.log("setTimeout2");
  }, 0);
});
setTimeout(() => {
  console.log("setTimeout1");
  Promise.resolve().then(() => {
    console.log("Promise2");
  });
}, 0);
/* 
      打印结果：
        Promise1
        setTimeout1
        Promise2

      1.开始执行，宏任务微任务依次放到队列中
        宏任务：[s1]
        微任务：[p1]
      2.清空微任务p1，打印Promise1,里面的s2放入宏任务中
        宏任务：[s1,s2]
        微任务：[]
      3.取出并执行宏任务 s1,打印setTimeout1，微任务为p2,执行并清空微任务，打印：Promise2
        宏任务：[s2]
        微任务：[p2]->[]
      4.取出并执行宏任务 s2,打印setTimeout2
        宏任务：[]
        微任务：[]
       */
```

```js
console.log(1);
async function async() {
  console.log(2);
  await console.log(3); // yield console.log(3);
  // Promise.resolve(console.log(3)).then(()=>  console.log(4))
  console.log(4);
}
setTimeout(() => {
  console.log(5);
}, 0);
const promise = new Promise((resolve, reject) => {
  resolve(7);
});
promise.then((res) => {
  console.log(6);
  console.log(res);
});
async();
console.log(8);
// 微任务队列：[6, 7, 4 ]   宏任务队列：[5]
// 1  2  3  8 [6,7,4]   5
```

```js
const Promise = require("./promise.js");

// ----原生的promise中 会判断如果返回的是一个promise，那么会给这个promise在产生一个微任务------
Promise.resolve()
  .then(() => {
    console.log(0);
    return Promise.resolve("a"); // x resolvePromise  x.then()
  })
  .then((res) => {
    console.log(res);
  });
Promise.resolve()
  .then(() => {
    console.log(1);
  })
  .then(() => {
    console.log(2);
  })
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(4);
  })
  .then(() => {
    console.log(5);
  });

/* 
    1. 微任务：[then0 then1 ]，两个微任务
    2. 执行 then0，打印0，返回一个 x.then()放入微任务，then0执行完毕去掉
        微任务：[then1,then('Primise.resolve产生的then')]
    3. 执行 then1, 打印 1，then2 放入微任务：[then('Primise.resolve产生的then'), then2]
    4. 执行 x.then()，微任务：[then2, x.then()的下一个 then]
    5. 执行 then2,打印 2，微任务：[x.then()的下一个 then， then3 ]
    ...
    最终结果：0 1 2 a 3 4 5 
 */

// [ then('Primise.resolve产生的then'),then2,then(空的promise)]

// 微任务执行是按照放入的顺序来执行的
```

### 二.Node 概念

#### 1.Node 是什么?

Node.js 是一个 JavaScript 运行环境，它是基于 Chrome's V8 引擎构建的，使 JavaScript 可以在服务器端运行。Node.js 特点：事件驱动、非阻塞 I/O 。(支持 ECMAScript、内置模块、第三方模块)

##### 1.1 事件驱动

指程序按照事件的发生顺序来触发响应的处理，能够在不阻塞其他事件的情况下处理多个事件。Node 中也有一个事件环，不断地检查事件队列中是否有新的事件，并触发相应的回调函数。适用于网络应用程序和 I/O 密集型应用程序。

##### 1.2 非阻塞 I/O

当程序发出一个 I/O 请求时，如果不能立即得到结果，不会阻塞程序的执行，而是立即返回，以便程序可以继续执行其他任
务。

#### 2.单线程与多线程

##### 2.1 多线程

优点：可以同时执行多个任务 （多个请求到来的时候，需要开启对应的线程来进行处理。利用线程池来进行优化） 可利用多
核 CPU 的资源。适合处理 CPU 密集型 （压缩、解密、加密）
缺点：线程间通信复杂、多线程间锁的问题、开辟线程需要占用内存等问题。

##### 2.2 单线程

优点：节约内存资源、没有锁的问题、调试容易。适合 I/O 密集型操作
缺点：无法充分利用多核 CPU，复杂操作会阻塞主线程。

#### 3. 同步和异步

同步：在执行一个操作时，程序必须等待该操作完成后才能继续执行下一步操作。
异步：在执行一个操作时，程序不需要等待该操作完成，而是可以继续执行其他任务。
思考：阻塞和非阻塞、同步和异步的关系？ 异步一定是非阻塞的吗，同步一定是阻塞的吗， 针对是调用方和被调用
方来说的。

#### 4. Node 使用场景？

- 搭建服务端，采用 koa、express、nestjs、eggjs 等
- 编写前端工具链，gulp、webpack、vite、rollup 以及常用的命令行工具
- 为前端服务，作为中间层使用，解决跨域问题、进行数据处理 BFF(Back-end For Front-end)
- SSR 服务端渲染
- 实现及时通讯应用，爬虫等

#### 5.为什么要有模块化

模块化规范：（cmd、amd）、umd、 iife、es6Module、commonJS 等

- 提升代码可重用性和可扩展性。
- 方便维护，高内聚低耦合，解决变量冲突问题，隔离
- Node 中实现模块采用函数来进行模块划分的。

- 组件化和模块化区别：组件化是基于 UI 的封装，模块化是业务逻辑的封装

#### 6. commonjs 规范

- 每个 js 文件都是一个模块
- 每个模块想去引用别人的模块，需要采用 require 语法 import
- 每个模块想被别人使用需要采用 module.exports 进行导出

```js
function Module(id) {
  this.id = id;
  this.exports = {};
}
Module._extensions = {
  ".js"(module) {
    const content = fs.readFileSync(module.id, "utf8");
    let wrapperFn = vm.compileFunction(content, [
      "exports",
      "require",
      "module",
      "__filename",
      "__dirname",
    ]);
    let exports = this.exports;
    let thisValue = exports;
    let require = req;
    let filename = module.id;
    let dirname = path.dirname(filename);
    Reflect.apply(wrapperFn, thisValue, [
      exports,
      require,
      module,
      filename,
      dirname,
    ]);
  },
};
Module.prototype.load = function (filename) {
  let ext = path.extname(filename);
  Module._extensions[ext](this);
};
function req(id) {
  let absPath = Module._resolveFilename(id);
  const module = new Module(absPath);
  module.load(absPath);
  return module.exports;
}
```
