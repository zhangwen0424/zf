// 数组截取 start->end + 填充
export type Splice<
  T extends any[],
  S extends number,
  E extends number,
  I extends any[] = [], // 插入的元素
  SA extends any[] = [], // 开头的索引
  C extends any[] = [], // 统计删除的个数
  F extends any[] = [] //最终结果集
> = T extends [infer L, ...infer R]
  ? SA["length"] extends S
    ? C["length"] extends E
      ? [...F, ...I, ...T]
      : Splice<R, S, E, I, SA, [...C, null], F>
    : Splice<R, S, E, I, [...SA, never], C, [...F, L]>
  : F;
// Slice<R, S, E, [...SA, never], C, F>
type A1 = Splice<[string, number, boolean, null, undefined, never], 0, 2>; // [boolean,null,undefined,never]               从第0开始删除，删除2个元素
type A2 = Splice<[string, number, boolean, null, undefined, never], 1, 3>; // [string,undefined,never]                     从第1开始删除，删除3个元素
type A3 = Splice<
  [string, number, boolean, null, undefined, never],
  1,
  2,
  [1, 2, 3]
>; // [string,1,2,3,null,undefined,never]          从第1开始删除，删除2个元素，替换为另外三个元素1,2,3                            从第0个位置开始，保留后面所有元素类型
