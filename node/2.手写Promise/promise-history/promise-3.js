// 1.promise 默认三个状态
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";
console.log("my");
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
    // 4.调用then 的时候来判断成功还是失败
    if (this.status == FULFILLED) {
      onFulfilled(this.value);
    }
    if (this.status == REJECTED) {
      onRejected(this.reason);
    }
    // 此时还没有确定promise的状态，需要保留成功的回调和失败的回调
    if (this.status == PENDING) {
      // 订阅
      this.onResolveCallbacks.push(() => {
        onFulfilled(this.value);
      });
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }
}
module.exports = Promise; // export default
