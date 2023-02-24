// 处理异步情况
const Promise = require("./promise");
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    // throw new Error("死了");
    reject("负债");
    resolve("有钱");
  });
});

promise.then(
  (value) => {
    console.log("成功1", value);
  },
  (reason) => {
    console.log("失败1", reason);
  }
);

promise.then(
  (value) => {
    console.log("成功2", value);
  },
  (reason) => {
    console.log("失败2", reason);
  }
);
