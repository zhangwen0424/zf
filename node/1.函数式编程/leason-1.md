## 函数式编程

### 1.什么是函数式编程

函数式编程是一种编程范式，强调使用函数来组合和处理数据。将运算过程抽象成成函数，可以复用。
常⻅的编程范式有：

- 面向过程编程（Procedural Programming）PP：按照步骤来实现，将程序分解为过程和函数。这些过程和函数按顺序执行来完成任务。
- 面向对象编程（Object-Oriented Programming）OOP：将程序分解为对象，每个对象都有自己的状态和行为。面向对象的核心是（类，实例，继承，封装，多态）
- 函数式编程（Functional Programming）FP：使用函数来组合和处理数据，描述数据之间的映射。函数指的并不是编
  程语言中的函数，指的是数学意义上的函数 y=f(x) 输入映射输出

  一个函数 f 接收一个参数 x，并根据 x 计算返回一个结果 y。

  ```js
  // 面向过程
  const arr = [1, 2, 3, 4, 5];
  let sum = 0;

  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  console.log(sum);
  // 面向对象
  class Calc {
    constructor() {
      this.sum = 0;
    }
    add(arr) {
      for (let i = 0; i < arr.length; i++) {
        this.sum += arr[i];
      }
    }
  }
  const calc = new Calc();
  calc.add([1, 2, 3, 4, 5]);
  console.log(calc.sum);

  // 函数式编程
  const sum = arr.reduce((memo, cur) => memo + cur, 0); // 高阶函数 + 纯函数
  console.log(sum);
  ```

### 2.函数式编程的优势

- 可维护性：函数式编程的程序通常更加简洁和可读，因为它们避免了状态变化和副作用。这使得代码更易于理解和维
  护。
- 可测试性：由于函数式编程程序通常是无副作用的，所以可以很容易地对其进行单元测试。
- 并发性：函数式编程程序通常是无副作用的，所以可以很容易地并行地执行。
- 扩展性：函数式编程程序通常是纯函数，可以很容易地组合和重用。
- 可靠性：函数式编程程序通常是无副作用的，所以可以很容易地预测其行为。
- Vue3 也开始拥抱函数式编程，函数式编程可以抛弃 this，打包过程中更好的利用 tree-shaking 过滤无用的代码

### 3.函数是一等公⺠

First-class Function（头等函数）当一⻔编程语言的函数可以被当作变量一样用时，则称这⻔语言拥有头等函数。

- 函数可以存储在变量中
- 函数可以作为参数
- 函数可以作为返回值

### 4.高阶函数(Higher-orderfunction)

一个函数的参数是一个函数，或者一个函数的返回值是一个函数。则称这个函数是高阶函数。

#### 4.1 函数作为参数

```js
// 通过函数的组合，抽象掉运算过程，封装实现的过程
Array.prototype.reduce = function (callback, startVal) {
  let arr = this;
  // 如果传递了开始的值 内部会从第0项开始循环， 如果没传，会从头开始循环 0,1
  // 基础值
  let acc = typeof startVal === "undefined" ? arr[0] : startVal;
  // 开始索引
  let sIndex = typeof startVal === "undefined" ? 1 : 0;
  for (let i = sIndex; i < arr.length; i++) {
    acc = callback(acc, arr[i], i, arr);
  }
  return acc;
};
// AOP 切片编程，对函数进行扩展
Function.prototype.before = function (beforefn) {
  return (...args) => {
    beforefn.call(this, ...args);
    return this(...args);
  };
};
```

#### 4.2 函数作为返回值

```js
// 缓存逻辑
function exec(a, b) {
  console.log("exec~~~");
  return a + b;
}
const memoize = (fn, resolver) => {
  const cache = new Map();
  return (...args) => {
    // 根据 resolver 计算 key
    const key = typeof resolver === "function" ? resolver(...args) : args[0];
    let result = cache.get(key);
    if (result === undefined) {
      result = fn(...args);
      cache.set(key, result);
    }
    return result;
  };
};
const resolver = (...args) => JSON.stringify(args);
let memoizedExec = memoize(exec, resolver);
console.log(memoizedExec(1, 2));
console.log(memoizedExec(1, 2)); // 第二次拿到了第一次的缓存结果,exec只执行一次
/* 
  exec~~~
  3
  3 
*/
```

### 5.纯函数

相同的输入永远会得到相同的输出，而且没有任何的副作用。（不会对外部环境产生影响，并且不依赖于外部状态）

```js
// 纯函数
function sum(a, b) {
  return a + b; // 相同的输入得到相同的输出
}

// 非纯函数
let count = 0;
function counter() {
  count++; // 依赖外部状态，多次调用返回结果不同
  return count;
}
let date = new Date();
function getTime() {
  // 不同时间调用，返回值不同
  return date.toLocaleTimeString();
}
```

常⻅副作用：

- 对全局变量或静态变量的修改
- 对外部资源的访问（如文件、数据库、网络 http 请求）
- 对系统状态的修改 （环境变量）
- 对共享内存的修改
- DOM 访问，打印/log 等

副作用使得方法通用性降低，让代码难以理解和预测，测试困难，导致静态问题等。

lodash 库中所有的方法都是纯函数

纯函数的好处： 可缓存（输入相同输出相同）、可测试（通过输入输出方便测试）、并行处理（可以在多线程环境下并行执行）

所以在开发时我们会采用纯函数及统一状态管理

### 6.柯里化

柯里化是一种函数转换技术，它将一个多参数函数转换为一系列单参数函数。与之类似的偏函数是指对于一个函数，固定其中一些参数的值，生成一个新函数，这个新函数接受剩下的参数

```js
function isType(typing, val) {
  return Object.prototype.toString.call(val) === `[object ${typing}]`;
}
// 每次执行都需要传入字符串, 可以利用高阶函数来实现参数的保留。 闭包的机制（执行上下文不会被销毁）
function isType(typing) {
  // typing
  return function (val) {
    // isString/ isNumber
    return Object.prototype.toString.call(val) === `[object ${typing}]`;
  };
}
```

lodash 中的柯里化函数。被科里化的函数所需的参数都被提供则执行原函数，否则继续返回函数等待接收剩余的参数

```js
const util = {};
["String", "Number", "Boolean"].forEach((typing) => {
  util["is" + typing] = isType(typing);
});
let curried = _.curry(isType); // 将函数进行柯里化处理
const isString = curried("String"); // 缓存参数

function add(a, b, c) {
  return a + b + c;
}
function curry(func) {
  let curried = (...args) => {
    if (args.length < func.length) {
      return (...rest) => curried(...args, ...rest);
    }
    return func(...args);
  };
  return curried;
}
let curriedAdd = curry(add);
```

通过柯里化可以实现缓存固定的参数返回新的函数。让函数的粒度更小。生成的一元函数更加方便组合使用。

### 7.函数组合

早期常⻅的函数组合写法：洋葱模型 c(b(a()))、过滤器 a() | b() | c()
函数的组合可以将细粒度的函数重新组合成一个新的函数。最终将数据传入组合后的新函数，得到最终的结果。
常⻅的有

- redux 中的 compose
- koa、express 中间件实现原理

```js
console.log(curriedAdd(1, 2, 3));
console.log(curriedAdd(1)(2, 3));
console.log(curriedAdd(1)(2)(3));
function double(n) {
  return n * 2;
}
function toFixed(n) {
  return n.toFixed(2);
}
function addPrefix(n) {
  return "£" + n;
}
const _ = require("lodash");
function flowRight(...fns) {
  if (fns.length === 0) {
    return fns[0];
  }
  return fns.reduceRight((a, b) => {
    return (...args) => b(a(...args));
  });
}
// a => (...args) => toFiexed(double(...args))
// b => addPrefix
// (...args)=> addPrefix(((...args) =>toFiexed(double(...args)))(...args))
const composedFn = flowRight(addPrefix, toFixed,double);
const returnVal = composedFn(10000);
console.log(returnVal);

const _ = require("lodash");
const str = "click button"; //CLICK*BUTTON

let flow1 = *.split(str, " ");
let flow2 = _.join(flow1, "_");
let flow3 = _.toUpper(flow2);
console.log(flow3);

// 将函数进行组合，先将函数进行转化
const split = _.curry((sep, str) => _.split(str,sep));
const join = _.curry((sep, str) => _.join(str,sep));
const composedFn1 = _.flowRight(_.toUpper,join("_"), split(" "));
console.log(composedFn1(str));

// lodash 函数式编程,帮我们自动科里化，并且数据最后传入
const lodash = require("lodash/fp"); // 会自动将内部的方法柯里化， 都给你处理成参数先行的特点
const composedFn2 = lodash.flowRight(_.toUpper,lodash.join("_"),lodash.split(" ")
);
console.log(composedFn2(str));

// 这种模式我们也称之为 PointFree，把数据处理的过程先定义成一种与参数无关的合成运算就叫 Pointfree 8.解决异步并发问题

```

总结：什么是函数式编程？ 函数式编程的基础：纯函数、柯里化、函数组合。将运算抽象成函数，可以利用这些函数进行重用组合。

### 8.解决异步并发问题

#### 8.1 哨兵变量

```js
const fs = require("fs"); // file system
const path = require("path");
let times = 0; // 哨兵变量
let school = {};
function out(key, value) {
  school[key] = value;
  if (++times == 2) {
    console.log(school);
  }
}
fs.readFile(path.resolve(__dirname, "age.txt"), "utf8", function (err, data) {
  out("age", data);
});
fs.readFile(path.resolve(__dirname, "name.txt"), "utf8", function (err, data) {
  out("name", data);
});
```

#### 8.2 函数式编程

```js
const fs = require("fs"); // file system
const path = require("path");
function after(times, callback) {
  // 高阶函数来解决异步并发问题
  let data = {};
  return function (key, value) {
    data[key] = value;
    if (--times === 0) {
      callback(data);
    }
  };
}
let out = after(2, (data) => {
  console.log(data);
});
fs.readFile(path.resolve(__dirname, "age.txt"), "utf8", function (err, data) {
  out("age", data);
});
fs.readFile(path.resolve(__dirname, "name.txt"), "utf8", function (err, data) {
  out("name", data);
});
```

#### 8.3 发布订阅模式

```js
const fs = require("fs");
const path = require("path");
// 发布订阅的核心就是将订阅函数存放到数组中，稍后事情发生了 循环数组依次调用
// 不订阅也能发布 （订阅和发布之间没有任何关系）
let school = {};
let events = {
  _arr: [],
  on(callback) {
    // 将要订阅的函数保存起来
    this._arr.push(callback);
  },
  emit(key, value) {
    school[key] = value;
    this._arr.forEach((callback) =>callback(school));
  }
};
events.on((data) => {
  if (Object.keys(data).length === 2) {
    console.log(data);
  }
});

events.on((data) => {
  console.log("读取一个完毕", data);
});
fs.readFile(path.resolve(**dirname, "age.txt"),"utf8", function (err, data) {
  events.emit("age", data);
});
fs.readFile(path.resolve(**dirname, "name.txt"),"utf8", function (err, data) {
  events.emit("name", data);
});
// 发布订阅模式，可以监控到每次完成的情况，而且可以自己控制逻辑

```
