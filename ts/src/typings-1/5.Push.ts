// 往数组中增加元素
export type Push<T extends any[], R> = [...T, R];
type A = Push<[1, 2, 3], 4>; // [1,2,3,4]
type B = Push<[1], 2>; // [1, 2]
