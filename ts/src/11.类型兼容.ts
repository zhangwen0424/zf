// 兼容性：子类型可以赋予给父类型。 结构上来看是否兼容
// ts中 结构化的类型系统 （鸭子类型检查）、 长得一样就ok。 比如果两个类型名字不一样但是无法区分

import { forEachChild } from "../node_modules/typescript/lib/typescript";

let obj: {
  toString(): string;
};
type T1 = string extends { toString(): string } ? true : false; // type T1 = true
let str: string = "abc";

// 这两个类型单从 类型层级来看 是不存在父子关系
obj = str; // 兼容性  我们可以把string 看成一个对象 基于toString扩展了其他的功能
obj.toString(); // 安全， 保证使用的时候不会发生异常

type xxx = keyof string;

// 接口类型
interface IAnimal {
  name: string;
  age: number;
}
interface IPerson {
  name: string;
  age: number;
  address: string;
}
let animal: IAnimal;
let person: IPerson = {
  name: "zw",
  age: 10,
  address: "",
};
animal = person; // 子类赋予给父类 兼容 、 你要的我都有安全

type T2 = IPerson extends IAnimal ? true : false; // type T2 = true

// 子 父关系 不要考虑 谁多谁少，考虑的是父子类型的层级关系

// 函数的兼容性，安全性来考虑
let sum1 = (a: string, b: string) => a + b;
let sum2 = (a: string) => a;
sum1 = sum2;

// 原生：forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
const forEach = (
  arr: any[],
  callback: (item: any, idx: number, array: any[]) => void
) => {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i, arr); // callback 没有执行， 所以无法推导arr[i] = T
  }
};
forEach(["a", "b", "c"], function (item) {
  console.log("item", item);
});

// 对应函数的参数来讲  少的参数可以赋予给多的，因为人家内部实现，传递了多个但是我用的少，安全，如果我多写了那就不安全的

let sum3!: () => string | number;
let sum4!: () => string;
sum3 = sum4;

class A {
  private name!: string;
  age!: number;
}
class B {
  private name!: string;
  age!: number;
}
// let a: A = new B();// 报错，私有属性不匹配

// 类型分为两种 结构化类型 ， 标称类型

class AddType<S> {
  private _type!: S;
}
type NewType<T, S extends string> = T & AddType<S>;
type BTC = NewType<number, "btc">; // number + BTC
type USDT = NewType<number, "usdt">; // number + USDT
let btc: BTC = 100 as BTC;
let usdt: USDT = 100 as USDT;
function getCount(count: USDT) {
  return count;
}
getCount(usdt); // 标称类型

// 逆变和协变  子 -》 父    协变  父 - 》子  （传父 、返子）

class Parent {
  house() {}
}
class Child extends Parent {
  car() {}
}
class Grandson extends Child {
  sleep() {}
}
// 都是可以通过父子关系来证明 兼容性的
function fn(callback: (instance: Child) => Child) {
  let r = callback(new Grandson());
  // r 是child的类型，如果用户返回了 new Grandson ， grandson 是属于child的子类型的
  // r.sleep; // 报错
}
// 1) 赋予值的时候可以赋予 自己和子类型
// 2) 内部调用callback的时候 可以传递 child 或者 Grandson（传递了grandson，但是在使用grandson中的属性肯定使用不了）
// 3) 如果用户回调中，使用属性的时候 要保证范围不能超过 Child控制的范围， 所以标识grandson的话可能会不安全, 但是标识Parent 是安全的，因为子类中的属性包含了parent

fn((instance: Parent): Child => {
  instance.house;
  return new Grandson();
});

// 一个值随着输入的变化而变化 协变， 相反就是逆变

type Arg<T> = (arg: T) => void;
type Return<T> = (any: any) => T;
type isArg = Arg<Parent> extends Arg<Child> ? true : false; // 逆变, type isArg = true
type isReturn = Return<Grandson> extends Return<Child> ? true : false; //协变, type isReturn = true

// 逆变带来的问题
interface Array<T> {
  //   concat: (...args: T[]) => T[]; // 校验了逆变
  concat(...args: T[]): T[]; // 跳过参数的逆变检测
  [key: number]: any;
}
let parentArr!: Array<Parent>;
let childArr!: Array<Child>;
// parent[] <-child[]
// (...args: Parent[]) => Parent[]  =  (...args: Child[]) => Child[];
parentArr = childArr; // 儿子应该可以赋予父亲

// 泛型的兼容性  泛型比较的是最终的结果 比较的不是泛型传递的参数
interface II<T> {
  a: T;
}
let a1!: II<string>;
let a2!: II<number>;

type xx = II<string> extends II<number> ? true : false; // type xx = false
// a1 = a2; //报错：不能将类型“II<number>”分配给类型“II<string>”。

// 枚举永远不兼容 不能将枚举赋予给另一个枚举
const enum E1 {
  a = 1,
}
const enum E2 {
  a = 1,
}
let a3!: E1;
let a4!: E2;
// a3 = a4;//报错：不能将类型“E2”分配给类型“E1”

export {};
