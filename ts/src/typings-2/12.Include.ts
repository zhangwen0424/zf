// 字符串中是否有指定字符串
export type Include<T extends string, S extends string> = T extends ""
  ? S extends ""
    ? true
    : false
  : T extends `${infer L}${infer C}${infer R}`
  ? true
  : "";
// T extends `${infer L}${infer R}` ? (S extends L ? true : false) : false;

type a1 = Include<"Jiang", "J">; // true
type a2 = Include<"Jiang", "i">; // true
type a3 = Include<"", "">; // true 空字符串时需要特殊处理
type a4 = Include<"", "a">; // false
