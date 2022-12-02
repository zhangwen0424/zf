// 深度替换指定字符串
export type Replace<
  T extends string,
  C extends string,
  RC extends string,
  F extends string = ""
> = C extends ""
  ? T extends ""
    ? RC
    : `${RC}${T}`
  : T extends `${infer L}${C}${infer R}`
  ? Replace<R, C, RC, `${F}${L}${RC}`>
  : `${F}${T}`;

// L = '' C = 'ha'  R = 其它的剩余的
// L = ' ' C = 'ha' R =  ha
type a1 = Replace<"ha ha ha 123", "ha", "he">; // "he he he 123"
type a2 = Replace<"jw", "jw", "jiangwen">; // "jiangwen"
type a4 = Replace<"", "", "jiangwen">; // "jiangwen"
type a3 = Replace<"a", "", "jiangwen">; // "jiangwena"
type a5 = Replace<"", "b", "jiangwen">; // ""
