// 去掉第一个
// infer 的特点，多个infer 默认第一个infer 取的是第一项
export type Shift<T extends any[]> = T extends [infer L, ...infer R] ? R : T;
type A = Shift<[1, 2, 3]>; // [2,3] . [never,2,3]
type B = Shift<[1]>; // []
type C = Shift<[]>; // []
