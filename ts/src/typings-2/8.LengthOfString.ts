// 字符串的长度

export type LengthOfString<
  T extends string,
  F extends any[] = []
> = T extends `${infer L}${infer R}`
  ? LengthOfString<R, [...F, null]>
  : F["length"];

type A = LengthOfString<"BFE.dev">; // 7
type B = LengthOfString<"">; // 0
