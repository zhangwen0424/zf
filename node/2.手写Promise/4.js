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

// promise实现链式调用采用的是每次调用then方法都会返回一个全新的promise ？  return this
// 如果一直是同一个promise，promise不能从成功变为失败
