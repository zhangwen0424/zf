// 判断是不是 never
type A = IsNever<never>; // true
type B = IsNever<string>; // false
type C = IsNever<undefined>; // false
type D = IsNever<any>; // false

// never 默认 使用extends 时候就会分发 （最终直接返回never）

export type IsNever<T> = [T] extends [never] ? true : false;
