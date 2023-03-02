## 异步流程和事件循环

promise 是用来决绝异步嵌套的问题, 类式的还有 Q 库
希望有一个通用的方法 可以将 node 的 api 转化成 promise （promise 化,promisify）

### promisify 的原理

```js
function promisify(fn) {
  // fn -> fs.readFile
  return function (...args) {
    // args -> path.resolve(__dirname, 'note.md'), 'utf8'
    return new Promise((resolve, reject) => {
      fn(...args, function (err, data) {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };
}

// 转化对象上的所有方法
function promisifyAll(obj) {
  for (let key in obj) {
    if (typeof obj[key] === "function") {
      obj[key] = promisify(obj[key]);
    }
  }
}
promisifyAll(fs); // 内部会识别对象上的所有方法 将属性依次的进行promise化
```

### 将 node 中的异步方法转换成 promise

```js
// 延迟对象， 如何将node中的异步方法转换成promise
const fsSync = require("fs/promises"); // 包内部自动转化过了
fsSync.readFile(path.resolve(__dirname, "name.txt"), "utf8").then((data) => {
  console.log(data);
});
```

### promise 的一些静态方法

#### Promise.deferred

promise 中的延迟对象，可以快速的创建一个 promise

```js
{
  static deferred() {
    let dfd = {};
    dfd.promise = new Promise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
}


function readFile(url) {
  const dfd = Promise.deferred();
  fs.readFile(url, "utf8", function (err, data) {
    if (err) return dfd.reject(err);
    dfd.resolve(data);
  });
  return dfd.promise;
}
readFile(path.resolve(__dirname, "name.txt")).then((data) => {
  console.log(data);
});
```

#### Promise.resolve、Promise.reject、Promise.catch

Promise.resolve 可以帮我们立刻创建一个成功的 promise,而且让这个值具备了.then 能力
Promise.resolve 会等待内部的 promise 执行完毕
Promise.reject 不会等待内部代码执行完毕
Promise.catch 的本质就是 then

// Promise.resolve
// Promise.reject
// Promise.prototype.catch
// Promise.prototype.then 中传递的函数都是异步执行的

```js
Promise.resolve(
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("ok");
    }, 1000);
  })
).then((data) => {
  console.log(data);
});
// ok

{
  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolve(value);
    });
  }
}
```

```js
Promise.reject(
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("no ok");
    }, 1000);
  })
)
  .catch((err) => {
    // catch的本质就是then
    console.log(err);
  })
  .then((data) => {
    console.log(data);
  });
// Promise { <pending> }
// undefined;

{
  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }

  catch(errCallback) {
    return this.then(null, errCallback);
  }
}
```

#### Promise.all、Promise.race

```js
Promise.all = function (values) {
  // 计数器
  let ret = []; // 最终返回的结果
  let len = values.length;
  return new Promise((resolve, reject) => {
    values.forEach((val, idx) => {
      Promise.resolve(val).then((data) => {
        ret[idx] = data; // 没成功一个和索引对应上
        if (--len === 0) {
          resolve(ret);
        }
      }, reject); // 任何一个promise失败嘞 直接就调用外层promise的失败
    });
  });
};

Promise.all([
  // 全部成功才成功，有一个失败就失败，成功的结果是按照调用的顺序来返回的
  fs.readFile(path.resolve(__dirname, "name.txt"), "utf8"),
  fs.readFile(path.resolve(__dirname, "age.txt"), "utf8"),
  123,
])
  .catch((err) => {
    console.log(err, "err");
  })
  .then((data) => {
    console.log(data);
  });

// 赛跑 比较那个promise的结果快，谁快用谁的
Promise.race = function (values) {
  return new Promise((resolve, reject) => {
    values.forEach((val, idx) => {
      Promise.resolve(val).then(resolve, reject);
    });
  });
};

Promise.race([
  fs.readFile(path.resolve(__dirname, "name.txt"), "utf8"),
  fs.readFile(path.resolve(__dirname, "age.txt"), "utf8"),
])
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err, "err");
  });
```

超时中断

```js
function withAbort(userPromise) {
  // 包装后返回的是一个promise，而且可以决定不采用用户的promise的结果
  // Promise.race([我内置的promise比用户的快，userPromise])
  let abort;
  let internalPromise = new Promise((resolve, reject) => {
    abort = reject; // 将内容的reject方法作为终止方法
  });

  let p = Promise.race([internalPromise, userPromise]);
  p.abort = abort;
  return p;
}
// 处理超时时间的
let p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("ok");
  }, 3000);
});
p = withAbort(p); // 没有终止promise执行，只是不采用他的结果了
setTimeout(() => {
  p.abort("超时");
}, 1000);
// 如果这个请求超过500ms了 结果我就不要了
p.then((data) => {
  console.log(data);
}).catch((err) => {
  console.log(err, "失败");
});

Promise.race([
  new Promise((resolve, reject) => {
    setTimeout(() => {
      return reject("超时了");
    }, 1000);
  }),
  new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve("成功了");
    }, 2000);
  }),
]).then(
  (data) => {
    console.log("data:", data);
  },
  (err) => {
    console.log("err:", err);
  }
);
```

### generator 迭代器

// Promise 通过链式调用解决了异步问题 .then(()=>{}).then().then() 还是基于回调来实现

// 就与 promise 把异步代码变得更像同步

// generator 是一个特殊的函数 （生成器） 这个函数可以暂停，也可以继续执行
// 可以通过 generator 来控制我们异步流程，类似于调试的 debugger
// 所谓的生成器 执行后返回的是迭代器，当我调用迭代器的时候 就可以向下继续执行

```js
// iterator 迭代器, 迭代器必须要拥有一个next方法
// next方法  {value:表示当前产出的值,done:是否函数执行完成}
function* read() {
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
console.log("4:", it.next("c")); // 4: { value: undefined, done: true }
```

// 手动调用，正常应该自动帮我们调用 next

```js
// 遍历的时候 就可以使用generator 来进行实现
// set 调用.values（）返回的就是迭代器
let set = new Set([1, 2, 3]);
console.log(set.values().next().value);
```

#### 类数组

// 将一个类数组转换成数组 , 有索引、有长度、能遍历 就是类数组

```js
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
console.log(arr);
```

#### generator+co

```js
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
```
