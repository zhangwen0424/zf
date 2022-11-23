// 泛型可以指定默认值  默认泛型 给泛型增加了默认值

import { getConstantValue } from "../node_modules/typescript/lib/typescript";

type Union<T = string> = T | number; // 场景就是如果用户不传入类型 我也希望有默认值
type t1 = Union;
type t2 = Union<boolean>;

// 泛型约束 约束传入的泛型类型 A extends B   A是B的子类型
// 此方法 传入number -》 number
// 传入 string -》 string
// boolean 这是错误的
function handle<T extends number | string>(val: T): T {
  return val;
}
let r1 = handle(123);
let r2 = handle("abc");
// let r3 = handle(true);

interface IWithLength {
  length: number;
}
// abc extends IWithLength 把字符串幻想成一个基于对象扩展的类型
function getLen<T extends IWithLength>(val: T) {
  return val.length;
}
getLen("abc");
getLen((a: number, b: string) => {});

// 约束索引的签名

function getVal<T extends object, U extends keyof T>(obj: T, key: U) {
  return obj[key];
}
getVal({ a: 2, b: 2, c: 3 }, "a");

// 条件类型 也会配合我们这个泛约束

// 对象中可以使用泛型  常见的就是描述接口的返回值
// code:200, data:?, message

interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
}
interface LoginRes {
  token: string;
}
function toLogin(): ApiResponse<LoginRes> {
  return {
    code: 200,
    data: {
      token: "token",
    },
  };
}
let r = toLogin();
r.data.token;

// 类中可以使用泛型
// 求列表中的最大值 调用的时候可以限制传入的类型
class MyList<T extends number | string> {
  private arr: T[] = [];
  add(val: T) {
    this.arr.push(val);
  }
  getMax(): T {
    let arr = this.arr;
    let max = arr[0];
    for (let i = 0; i < arr.length; i++) {
      let cur = arr[i];
      cur > max ? (max = cur) : void null;
    }
    return max;
  }
}
let list = new MyList();
list.add("1");
list.add(100);
console.log("list:", list, list.getMax()); // list: MyList { arr: [ '1', 100 ] } 100

// 泛型用于：函数、对象、类、在工具类型 . 泛型中 两个重要的默认值、 约束

export {};
