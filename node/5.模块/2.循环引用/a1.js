const b = require("./module-b");
console.log(b);
module.exports = "我是 a 模块";
// module-b.js
const a = require("./module-a");
console.log(a);
module.exports = "我是 b 模块";
// module-a.js
let moduleB;
module.exports = {
  saveModule(mod) {
    moduleB = mod;
  },
  say() {
    console.log("a 中的 say");
  },
  init() {
    moduleB.say();
  },
};
