const Promise = require("./promise.js");

// ----原生的promise中 会判断如果返回的是一个promise，那么会给这个promise在产生一个微任务------
Promise.resolve()
  .then(() => {
    console.log(0);
    return Promise.resolve("a"); // x resolvePromise  x.then()
  })
  .then((res) => {
    console.log(res);
  });
Promise.resolve()
  .then(() => {
    console.log(1);
  })
  .then(() => {
    console.log(2);
  })
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(4);
  })
  .then(() => {
    console.log(5);
  });

/* 
    1. 微任务：[then0 then1 ]，两个微任务
    2. 执行 then0，打印0，返回一个 x.then()放入微任务，then0执行完毕去掉
        微任务：[then1,then('Primise.resolve产生的then')]
    3. 执行 then1, 打印 1，then2 放入微任务：[then('Primise.resolve产生的then'), then2]
    4. 执行 x.then()，微任务：[then2, x.then()的下一个 then]
    5. 执行 then2,打印 2，微任务：[x.then()的下一个 then， then3 ]
    ...
    最终结果：0 1 2 a 3 4 5 
 */

// [ then('Primise.resolve产生的then'),then2,then(空的promise)]

// 微任务执行是按照放入的顺序来执行的
