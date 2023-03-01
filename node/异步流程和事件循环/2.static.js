const fs = require("fs/promises");
const path = require("path");
const Promise = require("./promise");

// promise 具备递归解析的功能

// Promise.resolve 可以帮我们立刻创建一个成功的promise,而且让这个值具备了.then能力
// Promise.resolve 会等待内部的promise执行完毕
// Promise.reject 不会等待内部代码执行完毕
// catch的本质就是then

// Promise.resolve(
//   new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("ok");
//     }, 1000);
//   })
// ).then((data) => {
//   console.log(data);
// });
// ok

// Promise.reject(
//   new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("no ok");
//     }, 1000);
//   })
// )
//   .catch((err) => {
//     // catch的本质就是then
//     console.log(err);
//   })
//   .then((data) => {
//     console.log(data);
//   });
// Promise { <pending> }
// undefined;

// after(2,console.log)
// 发布订阅  同步多个异步请求的结果，我们就采用这个Promise.all方法
// Promise.all = function(){
// }

// 不能用长度来判断完成的情况

// Promise.all = function (values) {
//   // 计数器
//   let ret = []; // 最终返回的结果
//   let len = values.length;
//   return new Promise((resolve, reject) => {
//     values.forEach((val, idx) => {
//       Promise.resolve(val).then((data) => {
//         ret[idx] = data; // 没成功一个和索引对应上
//         console.log("val", Promise.resolve(val));
//         if (--len === 0) {
//           resolve(ret);
//         }
//       }, reject); // 任何一个promise失败嘞 直接就调用外层promise的失败
//     });
//   });
// };
// console.log("promise.all", Promise.all.toString());

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
