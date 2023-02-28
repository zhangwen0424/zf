## 手写 Promise

### 1.什么是 Promise？

Promise 是一种用于异步编程的 JavaScript 对象。主要用于处理异步操作的结果。异步导致的问题：回调地狱（让代码难以阅读）、错误处理（无法统一处理错误）、多个异步操作（“同步结果”困难）

- Promise 可以使用.then()方法链式处理异步逻辑
- Promise 可以使用.catch()方法处理异步操作失败的情况
- Promise 提供.all()、.race()方法支持处理多个 Promise 对象的结果。

### 2.手写 Promise

#### 2.1 Promise 基础版本实现

- 1.每个 promise 都有三个状态 pending 等待态 fulfilled 成功态 rejected 失败态。
- 2.每个 promise 需要有一个 then 方法，.then()方法接受两个回调函数，一个是成功的回调另一个是失败的回调。
- 3.new Promise 中传递的函数会立即执行。
- 4.promise 对象的状态一旦更改后，即不能再改变。（一旦成功就不能失败，一旦失败就不能成功）。 5.当 promise 抛出异常后，也会变为失败态。

```js
// 创建promise的时候需要提供一个执行器 executor
// 1.  promise有三个状态 pending态   fulfilled 成功态   rejected失败态
// 2.  每个promise都一个then方法，成功和失败的回调
// 3.  resolve和reject是两个函数，交给用户使用的 用户可以调用resolve变成成功态
// 4.  executor是立刻执行的
// 5.  promise 一但状态发生变化后就不能再修改了
// 6.  抛出错误也会导致promise失败

const Promise = require("./promise");
const promise = new Promise((resolve, reject) => {
  // setTimeout(() => {
  // throw new Error("死了");
  reject("负债");
  resolve("有钱");
  // });
});
promise.then(
  (value) => {
    // 成功的回调
    console.log("成功", value);
  },
  (reason) => {
    // 失败的回调
    console.log("失败：", reason);
  }
);

// 1.promise 默认三个状态
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";
console.log("my");
class Promise {
  constructor(exector) {
    // 2.用户传入一个executor
    this.status = PENDING;
    this.value = undefined; // 成功的值
    this.reason = undefined; // 失败的原因

    // 用户调用的成功和失败
    const resolve = (value) => {
      if (this.status == PENDING) {
        this.status = FULFILLED;
        this.value = value;
      }
    };
    const reject = (reason) => {
      if (this.status == PENDING) {
        this.status = REJECTED;
        this.reason = reason;
      }
    };
    // 如果executor在执行的时候抛出异常了
    // 这个异常就作为失败的原因
    try {
      // 3.这个代码执行的时候可能会发生异常
      exector(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onFulfilled, onRejected) {
    // 4.调用then 的时候来判断成功还是失败
    if (this.status == FULFILLED) {
      onFulfilled(this.value);
    }
    if (this.status == REJECTED) {
      onRejected(this.reason);
    }
  }
}
module.exports = Promise; // export default
```

#### 2.2 Promise 异步情况处理

- 调用 then 时 promise 的状态可能还是等待态，此时会将成功的回调和失败的回调收集起来，等待状态变化时在调用对应的回调。 （订阅）
- 同一个 promise 对象多次调用 then 方法。当成功或失败的时候这些回调会按照注册顺序被依次执行。（发布）

```js
const Promise = require('./1.promise')
let promise = new Promise((resolve,reject)=>{ // 默认pending状态
    setTimeout(()=>{
        resolve('success'); // 500ms后成功
    },500)
});
promise.then((value)=>{
    // 成功的回调
    console.log('success',value)
},(reason)=>{
    // 失败的回调
    console.log('fail',reason)
})
promise.then((value)=>{
    // 成功的回调
    console.log('success',value)
},(reason)=>{
    // 失败的回调
    console.log('fail',reason)
})
// success success
// success success
class Promise {
    constructor(executor) {
        // ...
        this.onResolvedCallbacks = []; // 存放成功的回调
        this.onRejectedCallbacks = []; // 存放失败的回调
        const resolve = value => {
            if (this.status === PENDING) {
                // ...
              this.onResolvedCallbacks.forEach(fn=>fn()); //成功时调用
            }
        };
        const reject = reason => {
            if (this.status === PENDING) {
                // ...
                this.onRejectedCallbacks.forEach(fn=>fn()); //失败时调用
            }
        };
        try {
            executor(resolve, reject);
        } catch (e) {
            reject(e);
        }
    }
    then(onFulfilled, onRejected) {
        // ...
        if(this.status === PENDING){
            // 等待态分别存入回调
            this.onResolvedCallbacks.push(()=>{
                onFulfilled(this.value);
            });
            this.onRejectedCallbacks.push(()=>{
                onRejected(this.reason);
            })
        }
    }
```

#### 2.3 Promise 链式调用

```js
const fs = require("fs");
const path = require("path");

// fs.readFile(path.resolve(__dirname,'fileUrl.txt'),'utf8',function(err,data){
//     if(err){
//         return console.log(err);
//     }
//     fs.readFile(path.resolve(__dirname,data),'utf8',function(err,data){
//         if(err){
//             return console.log(err);
//         }
//         console.log(data);
//     })
// })
```

上一个异步输出的结果，是下一个的输入，会导致回调嵌套问题（回调地狱问题 、恶魔金子塔）

- 解决方案采用 promise，将逻辑改变成链式调用 promise 中的 then 方法可以传递两个参数 （成功和失败的回调），这两个方法都可以返回值。

  - 返回的是 promise 对象，外层的下一次 then 会用这个 promise 的状态来决定走的是成功还是失败。
  - 返回的是一个普通值的情况 （不是 promise） 就会执行下一次的成功 (会将返回的值向下传递)
  - 如果抛出异常会执行外层下一次的 then 的失败。

```js
// 异步的方法先变成promise
function readFile(url) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, url), "utf-8", function (err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

// 1) 如果一个promise.then中的方法 返回的是一个promise, 那么会自动解析返回的promise。采用他的状态作为下一次then的结果. 会把解析后的值一并传入
// 2) 如果then中方法 返回的不是promise，则会直接走到下一次then的成功
// 3) then中方法抛出异常了 此时会走下一次then的失败
// 什么时候会让promise.then走失败 （返回失败的promise，抛出异常）

readFile("fileUrl.txt")
  .then(
    (data) => {
      return readFile(data);
    },
    (err) => {
      console.log("err", err);
      return false;
    }
  )
  .then(
    (data) => {
      console.log("下一次的 then success:" + data);
    },
    (err) => {
      console.log("下一次的then fail:" + err);
    }
  )
  .then(
    () => {
      console.log("不会走");
    },
    (err) => {
      console.log("err", err);
    }
  );
```

总结：就是返回值决定下一次 then 走成功还是失败，promise 为了实现链式调用需要返回了一个全新的 promise，这里不能返回 this，因为同一个实例不能从成功变为失败。

```js
class Promise {
  // ...
  then(onFulfilled, onRejected) {
    // 不停的创建新的 promise，来实现链式调用
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          // 为了保证promise2 已经产生
          try {
            let x = onFulfilled(this.value);
            // 用 x 来决定 promise2 是执行成功还是失败
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            // 执行对应的回调时发生异常就执行 promise2 的失败
            reject(e);
          }
        }, 0);
      }

      // 其它情况也是一样来处理...
    });
    return promise2;
  }
}
```

#### 2.4 resolvePromise 实现

    因为所有的 promise 都是按照 Promisea+规范来实现的，所以可以做到互相组合使用。此方法需要解决不同的 promise库之间的调用问题。

##### 1. x 和 promise2 引用同一个值

```js
const promise2 = new Promise((resolve, reject) => {
  resolve("ok");
}).then((data) => {
  return promise2; // 返回的 promise2 不会成功也不会失败。那就直接走失败了
});
promise2.then(null, (err) => {
  console.log(err);
});

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(
      new TypeError(
        "[TypeError:Chaining cycle detected for promise #<Promise>]"
      )
    );
  }
}
```

##### 2) 多次取 then 可能会发生异常

```js
// 其它人实现的 promise 可能是这样实现的~
let promise = {};
let times = 0;
Object.defineProperty(promise, "then", {
  get() {
    if (++times === 2) {
      throw new Error();
    }
  },
});
promise.then; // 第一次取 then 正常
promise.then; // 第二次取 then 报错

// 所以要避免多次取 then 的情况
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(
      new TypeError(
        "[TypeError:Chaining cycle detected for promise #<Promise>]"
      )
    );
  }
  // 如何判断x是不是promise?  就看有没有then方法，有then方法的前提得是x是一个对象或者函数
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    try {
      let then = x.then; // 缓存then
      if (typeof then === "function") {
        //看then是不是一个函数
        // 如果有一个then方法那么就说他是promise
        // 是promise 要判断是成功的promise还是失败的promise，在调用promise2对应的resolve或者reject
        then.call(
          x,
          (y) => {
            resolve(y);
          },
          (r) => {
            reject(r);
          }
        );
      } else {
        resolve(x); // 这里直接成功即可 普通值的情况
      }
    } catch (e) {
      reject(e); // 直接失败即可
    }
  } else {
    resolve(x); // 这里直接成功即可 普通值的情况
  }
}
```

##### 3. 防止重复调用

```js
let otherPromise = {
  then(onFulfilled, onRejected) {
    // 别人家的 promise 可能既调用了成功又调用了失败
    throw new Error(onFulfilled("ok"));
    onRejected("no ok");
  },
};
const promise2 = new Promise((resolve, reject) => {
  resolve("ok");
}).then((data) => {
  return otherPromise; // 返回的不是自己的
  promise;
});

if ((typeof x === "object" && x !== null) || typeof x === "function") {
  let called = false;
  try {
    let then = x.then;
    if (typeof then === "function") {
      then.call(
        x,
        (y) => {
          if (called) return; // 成功在调用失败
          called = true;
          resolve(y);
        },
        (r) => {
          if (called) return; // 失败在调用成功
          called = true;
          reject(r);
        }
      );
    } else {
      resolve(x);
    }
  } catch (e) {
    if (called) return; // 失败在调用成功
    called = true;
    reject(e);
  }
} else {
  resolve(x);
}
```

##### 4) 递归解析

```js
new Promise((resolve, reject) => {
  resolve();
})
  .then(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(
          new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(100);
            }, 1000);
          })
        );
      }, 1000);
    });
  })
  .then((data) => {
    console.log(data);
  });

then.call(
  x,
  (y) => {
    if (called) return;
    called = true;
    resolvePromise(promise2, y, resolve, reject); // 如果resolve的值还是promise，则递归析
  },
  (r) => {
    if (called) return;
    called = true;
    reject(r);
  }
);
```

#### 2.5 then 中可选参数

如果当前 then 中没有处理成功和失败，则会穿透到下一个
then 中进行处理

```js
const promise1 = new Promise((resolve,reject)=>{
    resolve('ok');
})
// 成功的传递
promise1.then().then().then((data=>{
    console.log(data)
}))
const promise2 = new Promise((resolve,reject)=>{
    reject('fail');
})pro

// 失败的传递
promise2.then().then().then(null,(err=>{
    console.log(err)
}))
then(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled ==='function' ? onFulfilled : v => v
  onRejected = typeof onRejected === 'function'
? onRejected : reason => { throw reason }
}
```

#### 2.6 测试 Promise

默认测试的时候会调用此方法 会检测这个方法返回的对象是否符合规范，这个对象上需要有 promise 实例及 resolve 和 reject 方法

npm install promises-aplus-tests -g # 测试包
promises-aplus-tests <filename>

```js

Promise.deferred = function () {
    let dfd = {}
    dfd.promise = new Promise((resolve, reject)
=> {
        dfd.resolve = resolve;
        dfd.reject = reject;
    })
    return dfd;
}
```

#### 2.7 resolve 问题解决

```js
const promise = new Promise((resolve, reject) => {
  // 在ECMAScript中
  // 我们在excutor中resolve一个promise会进行递归解析;
  resolve(
    new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("ok");
      }, 1000);
    })
  );
}).then((data) => {
  console.log(data); // ok
});

const resolve = (value) => {
  // 如果值是Promise，则需要进行递归解析
  if (value instanceof Promise) {
    return value.then(resolve, reject);
  }
  if (this.status === PENDING) {
    this.status = FULFILLED;
    this.value = value;
    this.onResolvedCallbacks.forEach((fn) => fn());
  }
};
```
