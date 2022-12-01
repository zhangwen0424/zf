// 字符串转元组
export type StringToTuple<
  T,
  F extends any[] = []
> = T extends `${infer L}${infer R}` ? StringToTuple<R, [...F, L]> : F;

type A = StringToTuple<"BFE.dev">; // ['B', 'F', 'E', '.', 'd', 'e','v']
type B = StringToTuple<"">; // []
