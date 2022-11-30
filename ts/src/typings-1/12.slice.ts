// 数组截取 start->end
import { Earth } from "../module/a";

export type Slice<
  T extends any[],
  S extends number, // 开始位置
  E extends number = T["length"], // 结束为止
  SA extends any[] = [], // 用于记录是否到达S
  EA extends any[] = [], // 用于记录是否到达E
  F extends any[] = []
> = T extends [infer L, ...infer R]
  ? // 看一下开头是否满足传入的开头，如果满足则放到队列中，并且再去截取后面的
    SA["length"] extends S // 只有当前索引和传入的长度相同时才会放入. 后续长度就不累加了，将其他的全部放入
    ? EA["length"] extends E // 如果放入的索引到达了结尾意味着放完了，那就把当前的这一项放到数组里结束
      ? [...F, L] // 返回最终的slice的结果
      : Slice<R, S, E, SA, [...EA, never], [...F, L]> // null 意味着让数组++
    : Slice<R, S, E, [...SA, never], [...EA, never], F>
  : F;

// any  ->  sa = 0   传入的也是0   F【any】
// never -> sa = 0    F【any,never】
// F【any,never,1】

// A2 any sa = 0 传入的也是1 此时any没有放入
//  never   sa = 1   ea=1  // [never]
//  1   sa = 1   ea=2 .  // [never,1]
//  '2'   sa = 1   ea=3  // [never,1,2]

// 结果集 []
// 1) . 开头索引和结尾索引  SA EA 每次拿到一项就向数组中放入一个
// 2) 如果到了开头的位置 就将当前项放入到结果集中. 如果当前EA['length'] . 和你传入的length 一样了。
// 3) 最终将结果返回即可

type A1 = Slice<[any, never, 1, "2", true, boolean], 0, 2>; // [any,never,1]                    从第0个位置开始，保留到第2个位置的元素类型
type A2 = Slice<[any, never, 1, "2", true, boolean], 1, 3>; // [never,1,'2']                    从第1个位置开始，保留到第3个位置的元素类型
type A3 = Slice<[any, never, 1, "2", true, boolean], 1, 2>; // [never,1]                        从第1个位置开始，保留到第2个位置的元素类型
type A4 = Slice<[any, never, 1, "2", true, boolean], 2>; // [1,'2',true,boolean]             从第2个位置开始，保留后面所有元素类型
type A5 = Slice<[any], 2>; // []                               从第2个位置开始，保留后面所有元素类型
type A6 = Slice<[], 0>; // []                               从第0个位置开始，保留后面所有元素类型
