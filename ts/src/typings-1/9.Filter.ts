// 数组过滤掉指定元素
export type Filter<T extends any[], A, F extends any[] = []> =
  // 先取出第一项，来判断是否满足，如果满足 需要递归处理R
  T extends [infer L, ...infer R]
    ? // 无论如何都要遍历剩余项， 所以在F这判断 是否要放到数组中，[L]数组包裹防止分发
      Filter<R, A, [L] extends [A] ? [...F, L] : F>
    : F;

type A = Filter<[1, "BFE", 2, true, "dev"], number>; // [1, 2]
type B = Filter<[1, "BFE", 2, true, "dev"], string>; // ['BFE', 'dev']
type C = Filter<[1, "BFE", 2, any, "dev"], string>; // ['BFE', any, 'dev']
