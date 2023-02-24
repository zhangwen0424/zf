const Promise = require("./promise");

// 问题1：
/* let promise2 = new Promise((resolve, reject) => {
  resolve();
}).then(() => {
  // promise2 是x，但是刚才说了如果返回的是一个promise
  // 需要采用这个promise的状态
  // 我们不会这样写代码。
  // return promise2;
});

promise2.then(
  (data) => {
    console.log(data);
  },
  (err) => {
    console.log("err", err);
  }
); */

// 问题2
let promise = {};
Object.defineProperty(promise, "then", {
  get() {
    throw new Error("报错");
  },
});
promise.then;
// promise.then 可能出错了
