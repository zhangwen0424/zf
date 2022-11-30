// 数组找到指定元素的索引
type isEqual<T, U, Success, Fail> = [T] extends [U]
  ? [U] extends [T]
    ? keyof T extends keyof U
      ? keyof U extends keyof T
        ? Success
        : Fail
      : Fail
    : Fail
  : Fail;
type x = isEqual<any, 1, true, false>; // type x = false, any是任何类型的子类型，需要判断：类型 + 结构

export type FindIndex<T extends any[], U, F extends any[] = []> = T extends [
  infer L,
  ...infer R
]
  ? isEqual<L, U, F["length"], FindIndex<R, U, [...F, never]>>
  : never;

// 找到值相等的索引
// 1） 找到两个值相等的一项，如何判断两个值是否相等？
// 2) 最终要返回的是索引， 内部构建一个数组，来记录当前遍历到了第几项
type a1 = [any, never, 1, "2", true];
type a2 = FindIndex<a1, 1>; // 2
type a3 = FindIndex<a1, 3>; // never
type a4 = FindIndex<a1, never>; // 1
