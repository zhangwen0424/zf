// 筛选对象中的可选属性

// 思路：可选属性和必选属性的区别:

// type x1 = {
//   foo: number | undefined;
//   bar?: string;
//   flag: boolean;
// };

// type x2 = Omit<x1, "bar">;

// let x1!: x1;
// let x2!: x2;

// x1 = x2; // 我们可以挨个的将属性忽略掉，如果忽略掉后还能赋予给原来的类型，说明是可选的，则保留起来

type a1 = OptionalKeys<{
  foo: number | undefined;
  bar?: string;
  flag: boolean;
}>; // bar
type a2 = OptionalKeys<{ foo: number; bar?: string }>; // bar
type a3 = OptionalKeys<{ foo: number; flag: boolean }>; // never
type a4 = OptionalKeys<{ foo?: number; flag?: boolean }>; // foo|flag
type a5 = OptionalKeys<{}>; // never

export type OptionalKeys<T, K = keyof T> = K extends keyof T // 这里是为了触发分发，因为要拿到每一个属性
  ? Omit<T, K> extends T
    ? K // 如果可以说明这个属性是可选的
    : never
  : never;

// 分发的条件：  裸类型、 条件  是泛型
// type A<T, K = keyof T> = K extends keyof T ? (a: K) => void : false; // 触发了分发

// type x = A<{
//   foo: number | undefined;
//   bar?: string;
//   flag: boolean;
// }>;
