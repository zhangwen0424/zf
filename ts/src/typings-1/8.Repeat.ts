// 数组填充指定元素

// ['length'] 取到数组的长度 在ts中和数量相关的全部采用 元组的长度来计算

// 3 . 0 . -> [number]
// 3 . 1   -> [number,number]
// 3 . 2   -> [number,number,number]
// 3 . 3   -> [number,number,number]

export type Repeat<T, C, F extends any[] = []> = C extends F["length"]
  ? F
  : Repeat<T, C, [...F, T]>;
type A = Repeat<number, 3>; // [number, number, number]
type B = Repeat<string, 2>; // [string, string]
type C = Repeat<1, 1>; // [1]
type D = Repeat<0, 0>; // []
