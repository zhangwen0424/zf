// 元组转字符串
export type TupleToString<T, F extends string = ""> = T extends [
  infer L,
  ...infer R
]
  ? TupleToString<R, `${F}${L & string}`>
  : F;
type A = TupleToString<["a", "b", "c"]>; // 'abc'
type B = TupleToString<["a"]>; // 'a'
type C = TupleToString<[]>; // ''
