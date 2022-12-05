// 联合类型转元组 1 | 2 | 3  -》 【1,2,3】 利用函数的交叉类型

type a = UnionToTuple<1 | 2 | 3>; // [1,2,3]
type b = UnionToTuple<1 | string | boolean>; // type b = [1, string, false, true]
type c = UnionToTuple<any>; // type c = [any]

type Q1 = UnionToTuple<string | number | symbol>; // type Q1 = [string, number, symbol]
type Q2 = UnionToTuple<string | number | symbol | boolean>; // type Q2 = [string, false, true, number, symbol]
type Q3 = UnionToTuple<string | number | symbol | boolean | [boolean]>; // type Q3 = [string, false, true, number, symbol, [boolean]]

type FindUnionOne<T> = (
  T extends any ? (a: (p: T) => any) => any : never
) extends (a: infer R1) => any // 1.先转化成函数的联合类型: type XX = ((p: 1) => any) & ((p: 2) => any) & ((p: 3) => any)
  ? R1 extends (a: infer R2) => any // 2.基于函数的分发实现对参数的交叉类型: type XX = 3
    ? R2
    : never
  : never;
// (a:(p:1)=>any) | (a:(p:2)=>any) | (a:(p:3)=>any)
// (a:(p:1)=>any) & (a:(p:2)=>any) & (a:(p:3)=>any)
type XX = FindUnionOne<1 | 2 | 3>;
// 找到最后一个，然后循环
export type UnionToTuple<T, L = FindUnionOne<T>> = [T] extends [never]
  ? []
  : [...UnionToTuple<Exclude<T, L>>, L];

// 思路

// 变成了函数重载
type X = ((p: string) => { a: string }) &
  ((p: number) => { b: string }) &
  ((p: boolean) => { c: string });
type Paramaters<T> = T extends (p: any) => infer R ? R : never; // 会返回重载的最后一个结果
type x = Paramaters<X>; // type x = { c: string; };
let x: X = (
  p: string | number | boolean
): { a: string; b: string; c: string } => {
  return { a: "1", b: "2", c: "3" };
};

// 函数的重载
function x3(p: string): { a: string };
function x3(p: number): { b: string };
function x3(p: boolean): { c: string };
// 上面等价于下面
function x3(p: string | number | boolean): { a: string; b: string; c: string } {
  return { a: "1", b: "2", c: "3" };
}
