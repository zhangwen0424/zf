// 传入字符串，首字母大写
export type CapitalizeString<T> = T extends string ? `${Capitalize<T>}` : T;
type a1 = CapitalizeString<"handler">; // Handler
type a2 = CapitalizeString<"parent">; // Parent
type a3 = CapitalizeString<233>; // 233
