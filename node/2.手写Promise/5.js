const fs = require("fs");
const path = require("path");
const Promise = require("./promise");

const promise2 = new Promise((resolve, reject) => {
  resolve();
}).then(
  () => {
    return 123; // 用then函数中的返回值来决定这个promise2走成功还是失败  -> x
  },
  () => {
    return "abc";
  }
);

// x的结果来决定调用promise2的resolve还是reject
promise2.then(
  (data) => {
    console.log(data, "success");
  },
  (err) => {
    console.log(err, "fail");
  }
);
