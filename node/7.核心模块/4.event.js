// 事件模块 fs url path  events 核心模块，不需要安装

// node中提供的发布订阅模块  实现异步处理。 解耦合

const EventEmiter = require("events");
const util = require("util"); // promisify
let e = new EventEmiter();

// 原型继承
// Object.create()
// Object.setPrototypeof
// Girl.prototype.__proto__ = EventEmiter.prototype
// Girl extends EventEmitter

function Girl() {}

Object.setPrototypeOf(Girl.prototype, EventEmiter.prototype); // 让 Girl 继承原型的方法,原型继承

let girl = new Girl();

let set = new Set(); //eventName
girl.on("newListener", (eventName) => {
  if (!set.has(eventName)) {
    girl.emit(eventName);
    // set.add(eventName);
    // process.nextTick(() => {
    //   set.delete(eventName);
    //   girl.emit(eventName);
    // });
  }
});

girl.on("失恋", function (v) {
  console.log("逛街");
});
girl.on("失恋", function () {
  console.log("吃饭");
});
girl.on("失恋", function () {
  console.log("哭");
});
girl.on("失恋", function () {
  console.log("哭");
});

girl.emit("失恋");
