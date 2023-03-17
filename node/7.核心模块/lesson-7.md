## 一.Buffer 的使用

### 1).buffer 的声明方式

```js
Buffer.alloc(3); // 根据⻓度来声明 buffer
Buffer.from([0x16, 100]); // 通过指定存储内容来声明
Buffer.from("Jiang"); // 通过字符串来声明 buffer
```

### 2).buffer.copy

```js
const b1 = Buffer.from("你好");
const b2 = Buffer.from("世界"); // （就是声明一个更大的将以前的放进去） copy
Buffer.prototype.copy = function (
  target,
  targetStart,
  sourceStart = 0,
  sourceEnd = this.length
) {
  for (let i = 0; i < sourceEnd - sourceStart; i++) {
    target[targetStart + i] = this[sourceStart + i]; // buffer 中存放的都是引用类型
  }
};
```

### 3).Buffer.concat

```js
Buffer.concat = function (
  list,
  totalLength = list.reduce((memo, current) => (memo += current.length), 0)
) {
  const bigBuffer = Buffer.alloc(totalLength);
  let pos = 0;
  list.forEach((buf) => {
    buf.copy(bigBuffer, pos);
    pos += buf.length;
  });
  return bigBuffer;
};
const bigBuffer = Buffer.concat([b1, b2]);
```

### 4).buffer.split

```js
Buffer.prototype.split = function (sep) {
  sep = Buffer.isBuffer(sep) ? sep : Buffer.from(sep);
  let len = sep.length; // 是对应分割符的⻓度 是以字节为单位的
  let arr = [];
  let offset = 0;
  let idx = 0;

  while (-1 !== (idx = this.indexOf(sep, offset))) {
    arr.push(this.slice(offset, idx));
    offset = idx + len;
  }
  arr.push(this.slice(offset));
  return arr;
};
let arr = buf.split("---");
console.log(arr);
```

### 笔记

buffer.js

```js
// buffer 代表的是内存中存的二进制数据 （buffer中存放的都是引用类型）
// buffer 一但声明了大小之后 不能更改声明的大小

// buffer的声明方式 3种 1）通过长度来声明 2) 通过数组方式来声明（基本不用） 3)通过字符串来声明 new Buffer
// ts 类型工具库 @types/node

// 在开发中都是以字节为单位的,
// const buf1 = Buffer.alloc(3); // 展现形式是16进制
// console.log(buf1); //<Buffer 00 00 00>

// const buf2 = Buffer.from([0x10, 0x20, 0x30]);
// console.log(buf2); // <Buffer 10 20 30>

// const buf3 = Buffer.from("你好");
// console.log(buf3);

// buffer的扩容问题 http请求传输二进制的时候 就是一段段
const buf1 = Buffer.from("你好");
const buf2 = Buffer.from("世界");
// buffer 可以通过长度(字节长度)和索引来访问

// （经常会将多个buffer拼接成一个buffer 进行扩容）
// 1) 断点续传， 分片上传  -》 大段
// 2) http请求也是分段传输的
const big = Buffer.alloc(buf1.length + buf2.length); // buf2.length字符长度
// targetStart  sourceStart   sourceEnd

// buffer的拷贝，一般不用，一般用 Buffer.concat
Buffer.prototype.copy = function (
  target,
  targetStart,
  soucreStart = 0,
  sourceEnd = this.length
) {
  // console.log("my", target, targetStart, soucreStart, sourceEnd);
  for (let i = 0; i < sourceEnd - soucreStart; i++) {
    target[targetStart + i] = this[soucreStart + i];
  }
};
buf1.copy(big, 0);
buf2.copy(big, 6);
// console.log(buf1, buf2, big); // <Buffer e4 bd a0 e5 a5 bd> <Buffer e4 b8 96 e7 95 8c> <Buffer e4 bd a0 e5 a5 bd e4 b8 96 e7 95 8c>

// Buffer.concat()  concat 实现多个buffer拼接的。
Buffer.concat = function (
  bufList,
  total = bufList.reduce((acc, cur) => acc + cur.length, 0)
) {
  // 内部需要创建buffer
  const buf = Buffer.alloc(total);
  let offset = 0;
  for (let i = 0; i < bufList.length; i++) {
    const cur = bufList[i];
    cur.copy(buf, offset);
    offset += cur.length;
  }
  // 我们可以将不需要的部分给删除掉，就是数组的slice
  return buf.slice(0, offset);
};
// console.log(Buffer.concat([buf1, buf2], 100));

// slice 方法要慎重 截取某一段 , 对于buffer而言浅拷贝
const oldArr = [[0], 1, 2];
const arr = oldArr.slice(0, 1);
arr[0][0] = 100;
// console.log(oldArr); // [ [ 100 ], 1, 2 ]

const buf = Buffer.alloc(100);
const c = buf.slice(0, 1);
c[0] = 100;
// console.log(buf);
// 如果想生成一个新的buffer和原来的内容一样 应该采用的是创建一个新的buffer，把内容粘贴进去，而不是采用slice

// 行读取器， 每次读取内容的一行。 数据传输 formdata
const fs = require("fs");
const path = require("path");
const { off } = require("process");
const r = fs.readFileSync(path.resolve(__dirname, "./test.txt"));
//buffer 上没有 slice，可通过 indexof 返回当前字符所在索引
// console.log(r.indexOf("\n", 7), r); //返回第 7 位之后的\n标识索引， windows 换行\r\n mac \n

Buffer.prototype.split = function (sep) {
  // 在node中处理数据的时候 要保证数据格式是统一的
  const arr = [];
  // sep要考虑：中文长度3和英文 长度 1，不一样， Buffer.from转成 buffer
  const sepLen = Buffer.isBuffer(sep) ? sep.length : Buffer.from(sep).length;
  let offset = 0;
  let cur = 0;
  while (-1 !== (cur = this.indexOf(sep, offset))) {
    arr.push(this.slice(offset, cur));
    offset = cur + sepLen; // 从当前的截取的下一个分割符号的位置为开头继续查找
  }
  // console.log(offset);
  arr.push(this.slice(offset)); // 最后一段也要放进来
  return arr;
};
console.log(r, r.split("\n")); // <Buffer 61 62 63 e4 bd a0 0a 64 65 66 0a 67> [ <Buffer 61 62 63 e4 bd a0>, <Buffer 64 65 66>, <Buffer 67> ]

// let arr = r.split("\n");
// for (let i = 0; i < arr.length; i++) {
//   arr[i] = arr[i].toString() + 1;
// }
// console.log(arr);

// 常用的buffer方法
// .length
// .concat
// isBuffer
// .slice
// .split自己封装的
```

mjs 问题
package.json 中增加 type:'module',文件可不用 .mjs 结尾 直接用 .js

```js
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
```

## 二.events 模块

node 中提供的发布订阅模式

```js
const EventEmitter = require("events");
function Girl() {}
Object.setPrototypeOf(Girl.prototype, EventEmitter.prototype);
let girl = new Girl();
let flag = false;
girl.on("newListener", (type) => {
  // 此方法可以监控到用户绑定了哪些事件
  if (!flag) {
    // 批处理的实现
    process.nextTick(() => {
      girl.emit(type);
    });
    flag = true;
  }
});
girl.on("女生失恋了", () => {
  console.log("狂吃");
});
girl.on("女生失恋了", () => {
  console.log("逛街");
});
girl.on("女生失恋了", () => {
  console.log("哭哭哭");
});
```

### 1).事件订阅

```js
function EventEmitter() {
  this._events = {};
}
EventEmitter.prototype.on = function (eventName, fn) {
  if (!this._events) this._events = {};
  (this._events[eventName] || (this._events[eventName] = [])).push(fn);
};
```

### 2).事件发布

```js
EventEmitter.prototype.emit = function (eventName, ...args) {
  if (!this._events) this._events = {};
  let eventLists = this._events[eventName];
  if (eventLists) eventLists.forEach((fn) => fn(...args));
};
```

### 3).取消订阅

```js
EventEmitter.prototype.off = function (eventName, fn) {
  if (!this._events) this._events = {};
  let eventLists = this._events[eventName];
  if (eventLists) {
    this._events[eventName] = eventLists.filter((item) => item != fn);
  }
};
```

### 4).绑定一次

```js
EventEmitter.prototype.once = function (eventName, fn) {
  if (!this._events) this._events = {};
  const once = (...args) => {
    fn.call(this, ...args);
    this.off(eventName, once); // 触发 once 函数后将 once 移除掉
  };
  once.l = fn;
  this.on(eventName, once);
};
EventEmitter.prototype.off = function (eventName, fn) {
  // ...
  if (eventLists) {
    this._events[eventName] = eventLists.filter(
      (item) => item != fn && item.l != fn
    );
  }
};
```

### 5).监控事件绑定

```js
EventEmitter.prototype.on = function (eventName, fn) {
  if (!this._events) this._events = {};
  // 绑定的方法不叫 newListener,就要触发newListener 方法
  if (eventName !== "newListener") {
    this.emit("newListener", eventName);
  }
  // ...
};
```

三.path 模块
