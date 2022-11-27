// unknown 和 any都是顶级类型 ， unknown是any的安全类型

// any 随意 不进行类型检测了
// unknown 还是要检测的 相对于any来说 在没有确定类型之前是不能操作的。 不能当做函数、类、对象

let c: unknown = 1;

function isFunction(val: unknown): val is () => void {
  return typeof val === "function";
}
function isString(val: unknown): val is string {
  return typeof val === "string";
}
// unknown 在使用前要进行类型检测
if (isFunction(c)) {
  c();
} else if (isString(c)) {
  c.toLowerCase();
}

// unknwon 的特点
type unionUnknown = unknown | null | undefined | string; // type unionUnknown = unknown, unknown true|false => boolean
type interUnknown = unknown & string; // type interUnknown = string
// 经常我们写一写泛型要求泛型的类型是字符串 (K & string) . (T & {})

type isNever = keyof unknown; // type isNever = never, unknown没有key，不能用 keyof，索引查询

type Compute<T> = {
  [X in keyof unknown]: T[X];
};
type X = Compute<unknown>; // type X = {}
let r: unknown = JSON.parse("{a:1}"); // let r: unknown
// r.a; // 类型“unknown”上不存在属性“a”

export {};
