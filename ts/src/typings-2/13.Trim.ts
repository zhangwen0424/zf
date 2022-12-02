// 去除首位空字符串
export type TrimLeft<T extends string> = T extends ` ${infer R}`
  ? TrimLeft<R>
  : T;
export type TrimRight<T extends string> = T extends `${infer R} `
  ? TrimRight<R>
  : T;

type x = TrimLeft<"  a  b">;

type Trim<T extends string> = TrimLeft<TrimRight<T>>;
type a1 = Trim<"   .jiang  ">; // ".jiang"
