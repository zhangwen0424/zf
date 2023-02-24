// 'click button' -> 'CLICK_BUTTON'
const _ = require("lodash");

const str = "click button";

let pp1 = _.split(str, " ");
let pp2 = _.join(pp1, "_");
let pp3 = _.toUpper(pp2);

// 组合的要求必须 是一个参数的入参， 柯里化
// 函数式编程 是组合后，传递数据 ，拿到结果  str
const split = _.curry((sep, str) => _.split(str, sep));
const join = _.curry((sep, str) => _.join(str, sep));

const composed = _.flowRight(_.toUpper, join("_"), split(" "));
console.log(composed(str), "curry + compose");

const lodash = require("lodash/fp"); // 会自动将内部的方法柯里化， 都给你处理成参数先行的特点
const composedFn1 = _.flowRight(
  lodash.toUpper,
  lodash.join("_"),
  lodash.split(" ")
);
console.log(composedFn1(str));

// redux + compose
// 小结：函数式编程的基本 纯函数、柯里化、组合来进行数据的处理。 可以将一些复杂的运算逻辑抽象成函数。 可以复用
