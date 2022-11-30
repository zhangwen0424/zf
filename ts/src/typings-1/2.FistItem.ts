// 数组中的第一项;
export type FirstItem<T extends any[]> = T[0];
type A = FirstItem<[string, number, boolean]>; // string
type B = FirstItem<["B", "F", "E"]>; // 'B'
