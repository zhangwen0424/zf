// 类型推断

// 1) 赋值推断

let name = "zw";
let age = 13;
let male = true;

// 2) 类型推断是从右向边向左边

// 函数的返回值可以自动推断
function sum(a: string, b: string) {
  return a + b;
}
// 3) 反向推断，从左向右  上下文类型
type ISum = (x: string, y: string) => string;

const sum1: ISum = (a, b) => {
  // a -> stirng b => stirng
  return a + b; // -> string
};

type ICallback = (x: string, y: string) => void; // 不关心返回值
function fn(cb: ICallback) {
  let r = cb("1", "2"); //let r: void, 调用函数后不会根据返回值来推导，默认采用就是上下文中声明的类型
}

// 函数的参数 推断是按照上下文类型的位置来推断的
fn((a, b) => {});

// void 为什么设计成这个样子？ 干脆直接 要求必须void不就好了么？
let total = 0;
[1, 2, 3].forEach((item, index, arr) => (total += item));

export {};
