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
