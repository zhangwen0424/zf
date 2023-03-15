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
