// 面向过程
const arr = [1, 2, 3, 4, 5];
// function calc(){
//     let sum = 0;
//     for(let i = 0; i < arr.length;i++){ // 运算过程
//         sum+=arr[i]
//     }
//     return sum
// }
// console.log(calc());

// 面向对象, 为何状态和行为
// class Calc {
//     constructor(){
//         this.sum = 0
//     }
//     add(arr){
//         for(let i = 0; i < arr.length;i++){ // 运算过程
//             this.sum+=arr[i]
//         }
//     }
// }

// const calc = new Calc()
// calc.add(arr)
// console.log(calc)

// 高阶函数 + 纯函数 （输入相同输出就相同）

// 每个函数抽象了运算的过程，没有this  Vue3 所有的响应式api  setup(){}   watch() computed(()=>{})
// const total = arr.reduce((acc,cur)=> acc + cur,0)
// console.log(total)

let x = function () {};

// 高阶函数的概念  满足1 或 2 都是高阶函数

// 1)
function fn1(cb) {
  // cb = 函数， fn 就是高阶函数
}

// 2)
function fn2() {
  // 高阶函数
  return function () {};
}

// 高阶函数  参数是函数的的情况, 函数式编程就是对运算过程的抽象
Array.prototype.reduce = function (callback, startVal) {
  // 如果传递了开始的值 内部会从第0项开始循环， 如果没传，会从头开始循环 0,1
  let arr = this;

  // 基础值
  let acc = typeof startVal == "undefined" ? arr[0] : startVal;
  // 开始索引
  let sIndex = typeof startVal == "undefined" ? 1 : 0;
  for (let i = sIndex; i < arr.length; i++) {
    acc = callback(acc, arr[i]);
  }
  return acc;
};

const total = arr.reduce((acc, cur) => acc + cur, 0);
console.log(total);

// 切片编程，  AOP 对我们已有的逻辑进行扩展，但是不破坏原来的逻辑
function say(val) {
  console.log(val);
}
Function.prototype.before = function (callback) {
  return (...args) => {
    callback(...args);
    this(...args);
  };
};

let newSay = say.before(() => {
  // before 高阶函数了
  console.log("before say");
});
newSay("我说了一句话");

// 函数作为参数 多数都是对我们的原有函数进行扩展

// 函数作为返回值的情况
// 纯函数的好处  相同的输入 会有相同的输出 , 纯函数可以进行缓存

function exec(a, b) {
  console.log("runner~~~");
  return a + b;
}
const resolver = (...args) => {
  return JSON.stringify(args); // [1,2]
};
function memoize(fn, resolver) {
  const cache = new Map();
  return function (...args) {
    const key = typeof resolver == "function" ? resolver(...args) : args[0];
    let result = cache.get(key);
    if (result == undefined) {
      result = fn(...args);
      cache.set(key, result);
    }
    return result; // js的缓存
  };
}
const _ = require("lodash"); // 加载一个第三方模块

// let memorizedExec = _.memoize(exec, resolver); // resolver 需要返回一个缓存的key
let memorizedExec = memoize(exec, resolver); // resolver 需要返回一个缓存的key
console.log(memorizedExec(1, 2));
console.log(memorizedExec(1, 2)); // 第二次拿到了第一次的缓存结果,exec只执行一次

let newFn = _.after(2, function () {
  // promise all
  console.log("runner fn");
});

newFn();
newFn(); // 超过运行次数2的时候 才会真正的执行

// 闭包： 真正的开发中我们理解的闭包：词法作用域

// function a(){
//     // 当前定义的函数，记住了所在的词法作用于，b函数不在当前词法作用域中执行，此时就会产生闭包
//     let c = 100; // 只要记住了这个词法作用域 就是闭包
//     return () =>{

//     }
// }

// 记住变量，after、memerize 也可以缓存。 函数作为参数和返回值是函数的情况我们可以进行缓存

// 点赞功能，如果点赞一次后 ，重复点赞无效

// 缓存，是一个纯函数

// exec(1,2)
// exec(1,2)
// exec(1,2)
