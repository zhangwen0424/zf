// 异步逻辑 并发问题 Promise.all

const fs = require("fs");
const path = require("path");

fs.readFile(path.resolve(__dirname, "name.txt"), "utf-8", function (err, data) {
  // console.log("name:", data);
  print("name", data);
});

fs.readFile(path.resolve(__dirname, "age.txt"), "utf-8", function (err, data) {
  // console.log("age:", data);
  print("age", data);
});

// 通过哨兵变量 来解决这类问题。
// let times = 0;
// let person = {};
// function print(key, value) {
//   person[key] = value;
//   if (++times == 2) {
//     console.log(person);
//   }
// }

function after(n, callback) {
  const data = {};
  return function (key, value) {
    data[key] = value;
    if (--n == 0) {
      callback(data);
    }
  };
}

// 整个过程我们无法监控，因为在使用函数的时候 我们没有处理的过程
let print = after(2, (data) => {
  console.log(data);
});

// 异步并发，我们最终需要一起获得到结果
