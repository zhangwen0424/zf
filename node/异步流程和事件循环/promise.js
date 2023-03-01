// 1.promise 默认三个状态
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";
console.log("my");

function resolvePromise(promise2, x, resolve, reject) {
  // console.log(promise2, x, resolve, reject);
  if (promise2 === x) {
    return reject(
      new TypeError(
        "[TypeError: Chaining cycle detected for promise #<Promise>]"
      )
    );
  }
  // 正常情况我们要分析x是不是promise, 如果x是普通值就直接和之前一样就resolve就好了
  // 判断这个x是不是promise，不能用instanceof 因为别人的promise和我的没法instanceof
  // 只有x 是对象或者函数才有可能是一个promise
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    let called = false;
    try {
      let then = x.then;
      // 直接采用上一次的取出来的then方法，不要重新取值否则还要触发get
      if (typeof then == "function") {
        then.call(
          x,
          function (y) {
            // 递归解析直到是普通值为止
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          function (r) {
            // 失败的时候调用
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        //说明 then就是一个对象而已
        // x:{then:{}
        // x:{}
        // x:function
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x); // 普通值直接成功即可
  }
}
class Promise {
  constructor(exector) {
    // 2.用户传入一个executor
    this.status = PENDING;
    this.value = undefined; // 成功的值
    this.reason = undefined; // 失败的原因

    this.onResolveCallbacks = []; // then中成功的回调
    this.onRejectedCallbacks = []; // then中失败的回调

    // 用户调用的成功和失败
    const resolve = (value) => {
      if (value instanceof Promise) {
        // 实现直接resolve一个promise的情况
        return value.then(resolve, reject);
      }
      if (this.status == PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolveCallbacks.forEach((fn) => fn());
      }
    };
    const reject = (reason) => {
      if (this.status == PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };
    // 如果executor在执行的时候抛出异常了
    // 这个异常就作为失败的原因
    try {
      // 3.这个代码执行的时候可能会发生异常
      exector(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onFulfilled, onRejected) {
    // 值的穿透，没写给你个默认值，让他传递到下一个then中即可
    onFulfilled = typeof onFulfilled == "function" ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };

    // 不停的创建新的 promise，来实现链式调用
    let promise2 = new Promise((resolve, reject) => {
      // 4.调用then 的时候来判断成功还是失败
      if (this.status == FULFILLED) {
        // 订阅，为了获取到promise2，为了保证promise2已经产生, 也可用 setTimeout
        process.nextTick(() => {
          try {
            let x = onFulfilled(this.value);
            // 用x的值来决定promise2 是成功还是失败
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          } // AOP 切片
        });
      }
      if (this.status == REJECTED) {
        process.nextTick(() => {
          try {
            let x = onRejected(this.reason);
            // 用x的值来决定promise2 是成功还是失败
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      // 此时还没有确定promise的状态，需要保留成功的回调和失败的回调
      if (this.status == PENDING) {
        // 订阅
        this.onResolveCallbacks.push(() => {
          process.nextTick(() => {
            try {
              let x = onFulfilled(this.value);
              // 用x的值来决定promise2 是成功还是失败
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            } // AOP 切片
          });
        });
        this.onRejectedCallbacks.push(() => {
          process.nextTick(() => {
            try {
              let x = onRejected(this.reason);
              // 用x的值来决定promise2 是成功还是失败
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });
    return promise2;
  }
  catch(errCallback) {
    return this.then(null, errCallback);
  }

  static all(values) {
    // 计数器
    let ret = []; // 最终返回的结果
    let len = values.length;
    return new Promise((resolve, reject) => {
      values.forEach((val, idx) => {
        Promise.resolve(val).then((data) => {
          console.log("ret", data);
          ret[idx] = data; // 没成功一个和索引对应上
          // console.log("ret", ret, data);
          if (--len === 0) {
            resolve(ret);
          }
        }, reject); // 任何一个promise失败嘞 直接就调用外层promise的失败
      });
    });
  }

  // promise 中的延迟对象，可以快速的创建一个promise
  static deferred() {
    let dfd = {};
    dfd.promise = new Promise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }

  static resolve(value) {
    console.log("value:", value);
    if (value instanceof Promise) return value;
    if (value === null) return null;
    // 判断如果是promise
    if (typeof value === "object" || typeof value === "function") {
      try {
        // 判断是否有then方法
        let then = value.then;
        if (typeof then === "function") {
          console.log("111");
          return new Promise(then.call(value)); // 执行value方法
        }
      } catch (e) {
        return new Promise((resolve, reject) => {
          reject(e);
        });
      }
    }
    return value;

    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        console.log("value111");
        // 实现直接resolve一个promise的情况
        return value.then(resolve, reject);
      }
      return resolve(value);
    });
  }
  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }
}

module.exports = Promise;
