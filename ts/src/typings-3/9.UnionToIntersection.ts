// 转换成：{a: string} & {b: string} & {c: string}， 函数的逆变和协变
export type UnionToIntersection<T> = (
  T extends any ? (a: T) => any : never
) extends (p: infer R) => any
  ? R
  : never;

type A = UnionToIntersection<{ a: string } | { b: string } | { c: string }>;
// {a: string} & {b: string} & {c: string}

// 函数逆变和协变   当给一个函数赋值的时候 参数可以传父亲，返回值可以返回儿子

// type A1 =
//   | ((a: { a: number }) => "人")
//   | ((a: { b: string }) => "狗")
//   | ((a: { c: boolean }) => "马");

// 一个函数的联合类型 ， 参数会变成交叉类型
// let a1: A1;
// a1()

// 传递的时候 可以传父返回子

// 儿子：{a:number,b:string,c:boolean}  父亲： {a:number}
// 我在给函数赋值的时候 赋予的是参数是父类

// let a1: A1 = (a: {a:number,b:string,c:boolean}): "人" => "人";

// type T1 = { name: string };
// type T2 = { age: number };

// type ToInterSection<T> = T extends [(x: infer X) => any, (x: infer X) => any]
//   ? X
//   : any;
// type T3 = ToInterSection<[(x: T1) => any, (x: T2) => any]>; // type T3 = T1 & T2
