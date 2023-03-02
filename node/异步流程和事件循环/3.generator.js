// Promise 通过链式调用解决了异步问题 .then(()=>{}).then().then() 还是基于回调来实现

// 就与promise 把异步代码变得更像同步

// generator 是一个特殊的函数 （生成器）  这个函数可以暂停，也可以继续执行
// 可以通过generator 来控制我们异步流程，类似于调试的debugger
// 所谓的生成器 执行后返回的是迭代器，当我调用迭代器的时候 就可以向下继续执行

// iterator 迭代器, 迭代器必须要拥有一个next方法
// next方法  {value:表示当前产出的值,done:是否函数执行完成}
/* function* read() {
  let a = yield "vue";
  console.log("a", a);
  let b = yield "react";
  console.log("b", b);
  return "node";
}

// next传递参数，特点是next中传递的参数是上一次yield的返回值，但是第一的next参数是无意义的
// 每次next传的参数都是给上一次yield的返回值
let it = read();
console.log("1:", it.next()); // 1: { value: 'vue', done: false }
console.log("2:", it.next("a")); // a a   2: { value: 'react', done: false }
console.log("3:", it.next("b")); // b b   3: { value: 'node', done: true }
console.log("4:", it.next("c")); // 4: { value: undefined, done: true } */

// 手动调用，正常应该自动帮我们调用next

// 遍历的时候 就可以使用generator 来进行实现
// set 调用.values（）返回的就是迭代器
// let set = new Set([1, 2, 3]);
// console.log(set.values().next().value);

/* 
// 将一个类数组转换成数组 , 有索引、有长度、能遍历 就是类数组
const likeArray = { 0: 1, 1: 2, 2: 3, length: 3 };
// Symbol 有很多操作可以改变原有的js的特性，元编程
// 方法 1
likeArray[Symbol.iterator] = function () {
  let arr = this;
  let len = arr.length;
  let idx = 0;
  return {
    next() {
      return { value: arr[idx], done: idx++ === len };
    },
  };
};
// 方法 2
likeArray[Symbol.iterator] = function* () {
  let len = this.length;
  let idx = 0;
  while (idx != len) {
    yield this[idx++];
  }
};
console.log(Array.from(likeArray));
const arr = [...likeArray];
console.log(arr); */

// generator 来处理异步逻辑的

const fs = require("fs/promises");
const path = require("path");
function* readFile() {
  try {
    let data = yield fs.readFile(
      path.resolve(__dirname, "fileUrl.txt"),
      "utf-8"
    );
    let name = yield fs.readFile(path.resolve(__dirname, data), "utf-8");
    return name;
  } catch (e) {
    console.log("读取出错", e);
  }
}

function co(it) {
  return new Promise((resolve, reject) => {
    // 递归回调
    function next(data) {
      let { value, done } = it.next(data);
      if (!done) {
        Promise.resolve(value).then((data) => {
          next(data);
        });
      } else {
        resolve(value); // 整个geneator执行完毕了 结束
      }
    }
    next(); // koa express
  });
}
co(readFile()).then((data) => {
  console.log(data);
});

// (async + await === generator + co) + promise的
