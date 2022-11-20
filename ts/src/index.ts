// 函数中的类型， 对于函数来说我们主要关心的是 函数的入参类型 和 函数的返回值类型

//function关键字 不涉及到变量类型的标注
// function sum(a: string, b: string): string {
//   return a + b;
// }
// sum("1", "2");

// 函数的声明方式有两种  function关键字来声明  表达式来声明
// 对于表达式声明而言，我可以给变量重新赋值
// 表达式我们如果给变量写好了一个类型，就意味着我们赋予的值要满足这个类型.
// type Sum = (x: string, y: number) => string; // 类型别名
// let sum: Sum = function (a: string, b: number): string {
//   return a + b;
// };
// sum("1", 2);

// --------------------------------------
// 函数的所有特性 都支持  可选参数  默认参数  剩余运算符都可以
// ? 表示参数可选     类型
// = 就是默认值的意思  js的默认值

type Sum = (x: string, y?: number) => string; // type 类型别名，?可选参数(可传可不传)
// let sum1: Sum = function (a, b) {
//   return a + b;
// };
// let r = sum1("1");// 可选参数

// 默认值
// let sum2 = function (a?: string, b = 234) {
//   return a + b;
// };

// 可选和默认值 都要放在最后面，下面报错：必选参数不能位于可选参数后
// let sum22 = function (a?: string, b: string) {
//   return a + b;
// };

let sum3 = function (a?: string, ...args: string[]) {
  // 剩余参数
  // 不需要arguments
  return args.reduce((m, c) => m + c, a);
};
let r = sum3("a", "b", "c");
console.log("r", r);

// TS中的  typeof 取变量的类型 返回的是类型  keyof 取的是类型的key的集合
function getName(this: any, key: string) {
  //this 必须是第一个参数
  return this[key];
}
const person = { name: "zw", age: 18 };

typeof Person = typeof person;
getName.call(person, "name");

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
export {};
