const fs = require("fs");
const path = require("path");
const Promise = require("./promise");

// promise 是用来决绝异步嵌套的问题, Q库

// function readFile(url) {
//   return new Promise((resolve) => {
//     fs.readFile(url, "utf-8", function (err, data) {
//       if (err) reject(err);
//       resolve(data);
//     });
//   });
// }
// readFile(path.resolve(__dirname, "name.txt")).then((data) => {
//   console.log(data);
// });

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

// 希望有一个通用的方法 可以将node的api 转化成promise （promise化,promisify）

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
// fs.readFile = promisify(fs.readFile); // 内部会识别对象上的所有方法 将属性依次的进行promise化
// fs.readFile(path.resolve(__dirname, "name.txt"), "utf8").then((data) => {
//   console.log(data);
// });

// toRef  toRefs
// 转化对象上的所有方法
function promisifyAll(obj) {
  for (let key in obj) {
    if (typeof obj[key] === "function") {
      obj[key] = promisify(obj[key]);
    }
  }
}
promisifyAll(fs); // 内部会识别对象上的所有方法 将属性依次的进行promise化
fs.readFile(path.resolve(__dirname, "name.txt"), "utf8").then((data) => {
  console.log(data);
});

// 延迟对象， 如何将node中的异步方法转换成promise
const fsSync = require("fs/promises"); // 包内部自动转化过了
fsSync.readFile(path.resolve(__dirname, "name.txt"), "utf8").then((data) => {
  console.log(data);
});
