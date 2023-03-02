const fs = require("fs/promises");
const path = require("path");
// const Promise = require("./promise");

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
//         if (--len === 0) {
//           resolve(ret);
//         }
//       }, reject); // 任何一个promise失败嘞 直接就调用外层promise的失败
//     });
//   });
// };

// Promise.all([
//   // 全部成功才成功，有一个失败就失败，成功的结果是按照调用的顺序来返回的
//   fs.readFile(path.resolve(__dirname, "name.txt"), "utf8"),
//   fs.readFile(path.resolve(__dirname, "age.txt"), "utf8"),
//   123,
// ])
//   .catch((err) => {
//     console.log(err, "err");
//   })
//   .then((data) => {
//     console.log(data);
//   });

// // 赛跑 比较那个promise的结果快，谁快用谁的
// Promise.race = function (values) {
//   return new Promise((resolve, reject) => {
//     values.forEach((val, idx) => {
//       Promise.resolve(val).then(resolve, reject);
//     });
//   });
// };

// Promise.race([
//   fs.readFile(path.resolve(__dirname, "name.txt"), "utf8"),
//   fs.readFile(path.resolve(__dirname, "age.txt"), "utf8"),
// ])
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((err) => {
//     console.log(err, "err");
//   });

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

// finally / .catch / .then
Promise.prototype.finally = function (fn) {
  return this.then((data) => Promise.resolve(fn()));
};
Promise.reject("err")
  // 就是then 特点就是无论成功还是失败都会执行的方法
  .finally(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("finally");
        resolve();
      }, 1000);
    });
  })
  .then((data) => {
    console.log("成功", data);
  })
  .catch((data) => {
    console.log("失败", data);
  });
