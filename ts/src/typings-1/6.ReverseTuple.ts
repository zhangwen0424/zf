// 数组反转
// 链表的反转 A -> B -> C -> D
//  D -> C -> B  -> A

// T -> [number, boolean] . F [string]
// T [boolean] , F[number ,string]

export type ReverseTuple<T extends any[], F extends any[] = []> = T extends [
  infer L,
  ...infer R
]
  ? ReverseTuple<R, [L, ...F]>
  : F;
type A = ReverseTuple<[string, number, boolean]>; // [boolean, number, string]
type B = ReverseTuple<[1, 2, 3]>; // [3,2,1]
type C = ReverseTuple<[]>; // []
