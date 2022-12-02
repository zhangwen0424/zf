// 驼峰转下划线
// 去掉第一个字符
export type RemoveFirst<T extends string, S> = T extends `${infer L}${infer R}`
  ? R
  : T;
export type KebabCase<
  T extends string,
  F extends string = ""
> = T extends `${infer L}${infer R}`
  ? KebabCase<R, `${F}${L extends `${Capitalize<L>}` ? `-${Lowercase<L>}` : L}`>
  : RemoveFirst<F, "-">;
export type a1 = KebabCase<"HandleOpenFlag">; // handle-open-flag
type a2 = KebabCase<"OpenFlag">; // open-flag
