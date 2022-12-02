// 下划线转驼峰
export type CamelCase<
  T extends string,
  F extends string = ""
> = T extends `${infer L}-${infer R1}${infer R2}`
  ? CamelCase<R2, `${F}${L}${Capitalize<R1>}`>
  : Capitalize<`${F}${T}`>;
// CamelCase<`${R2}`, `${F}${CamelCase<L>}${R1}`>

// L ->handle  R1->o  R2->pen-flag
// - 去掉，下一个字符要大写
type a1 = CamelCase<"handle-open-flag">; // HandleOpenFlag
type a2 = CamelCase<"open-flag">; // OpenFlag

// TS的同一个结果 有不同的实现方式 ，不是唯一的
