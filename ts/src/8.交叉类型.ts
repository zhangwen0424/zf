// 交叉类型（交集）会把多个类型变成一个类型 & 按位与 （都要满足才可以）、
// 联合类型 （并集） | 按位或

interface Person1 {
  high: string;
  address: {
    n: string;
  };
}
interface Person2 {
  handsome: string;
  address: {
    n: number;
  };
}
type Person11 = Person1 & Person2;
type Person22 = Person1 | Person2; // 联合类型是或的关系
type Temp11 = Person11["address"]["n"]; //type Temp11 = never
type Temp22 = Person22["address"]["n"]; //type Temp22 = string | number

// let p: Person11 = {
//   high: "",
//   address: {
//     n: "abc", // 报错：不能将类型“string”分配给类型“never”
//     // 我们的交叉类型 ，交叉出来的结果可以赋予给A 也可以富裕给B
//     // 生成的交叉类型 是 A B 的子类  ，内部的嵌套类型也会做交叉类型
//   },
// };
function mixin<T, U>(a: T, b: U): T & U {
  return { ...a, ...b };
}
let r = mixin({ a: 1, b: 2 }, { c: 3, b: "2" });
r.b;

// 计算 r 的类型
type Compute<T> = { [P in keyof T]: T[P] };
type x = Compute<typeof r>;
// 交叉后的结果 涵盖所有的内容

export {};
