// 判断是不是any

type A = IsAny<string>; // false
type B = IsAny<any>; // true
type C = IsAny<unknown>; // false
type D = IsAny<never>; // false

export type IsAny<T> = unknown extends T
  ? [T] extends [boolean]
    ? true
    : false
  : false;

type x1 = [unknown] extends [any] ? true : false; // type x = true
type x2 = any extends unknown ? true : false; // type x1 = true
type x3 = unknown extends boolean ? true : false; // type x3 = false
