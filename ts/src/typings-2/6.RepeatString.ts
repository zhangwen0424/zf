// 重复指定个数字符串
export type RepeatString<
  T extends string,
  C extends number,
  F extends any[] = [],
  S extends string = ""
> = F["length"] extends C ? S : RepeatString<T, C, [...F, null], `${S}${T}`>;

type A = RepeatString<"a", 3>; // 'aaa'
type B = RepeatString<"a", 0>; // ''
