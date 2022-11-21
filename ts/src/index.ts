// 泛型可以指定默认值  默认泛型 给泛型增加了默认值

type Union<T = string> = T | number; // 场景就是如果用户不传入类型 我也希望有默认值
type t1 = Union;
type t2 = Union<boolean>;

// 泛型约束 约束传入的泛型类型 A extends B   A是B的子类型
// 此方法 传入number -》 number
// 传入 string -》 string
// boolean 这是错误的
function handle<T extends number | string>(val: T): T {
  return val;
}
let r1 = handle(123);
let r2 = handle("abc");
// let r3 = handle(true);

interface IWithLength {
  length: number;
}
// abc extends IWithLength 把字符串幻想成一个基于对象扩展的类型
function getLen<T extends IWithLength>(val: T) {
  return val.length;
}
getLen("abc");
getLen((a: number, b: string) => {});

export {};
