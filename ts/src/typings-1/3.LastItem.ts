// 数组中最后一个
export type LastItem<T extends any[]> = T extends [...any, infer L] ? L : never;
type A = LastItem<[string, number, boolean]>; // boolean
type B = LastItem<["B", "F", "E"]>; // 'E'
type C = LastItem<[]>; // never
