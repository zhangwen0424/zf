// 异步逻辑 并发问题 Promise.all

const fs = require("fs");
const path = require("path");

const person = {};

let events = {
  _arr: [],
  on(fn) {
    // 订阅
    this._arr.push(fn);
  },
  emit(key, value) {
    person[key] = value;
    this._arr.forEach((callback) => callback(person));
  },
};

events.on(() => {
  // 订阅的事
  console.log("读取成功", person);
});
events.on(() => {
  // 订阅的事
  if (Reflect.ownKeys(person).length == 2) {
    console.log("person:", person);
  }
});

fs.readFile(path.resolve(__dirname, "name.txt"), "utf8", function (err, name) {
  events.emit("name", name);
});
fs.readFile(path.resolve(__dirname, "age.txt"), "utf8", function (err, age) {
  events.emit("age", age);
});
