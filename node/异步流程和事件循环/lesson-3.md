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

## promise 的一些静态方法

### Promise.deferred

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

### Promise.resolve、Promise.reject、Promise.catch

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
