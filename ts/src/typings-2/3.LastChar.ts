// 获取字符串最后一个字母
// 模板字符串中不能使用...
export type LastChar<
  T extends string,
  F = never
> = T extends `${infer L}${infer R}` ? LastChar<R, L> : F;

type A = LastChar<"BFE">; // 'E' .    E
type B = LastChar<"dev">; // 'v'
type C = LastChar<"">; // never
type D = LastChar<"A">; // A
