// 获取字符串第一个字母
type FirstChar<T> = T extends `${infer L}${infer R}` ? L : never;
type A = FirstChar<"BFE">; // 'B'
type B = FirstChar<"dev">; // 'd'
type C = FirstChar<"">; // never
