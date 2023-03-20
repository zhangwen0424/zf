import _ from "lodash";
import $ from "jquery";
import "./index.css";
export const add = (a, b) => a + b;
console.log("process.env.NODE_ENV ---- ", process.env.NODE_ENV);

// 这样写会全量引入,不管你的配置
// import "@babel/polyfill";

// 根据 浏览器兼容性引入 polyfile
// import "core-js/stable";
// import "regenerator-runtime/runtime";

// let sum = (a, b) => a + b;
// let promise = Promise.resolve();
// [1, 2, 3].find((item) => item === 2);

class A {}
class B extends A {}
console.log(new B());
