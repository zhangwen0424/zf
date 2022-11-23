// TS中的基础类型
// string number boolean null undefiend void(描述函数的返回值)
// 数组、元祖、枚举（常量枚举、普通枚举）
// never 所有类型的子类型（底端类型） 如果这个值我不需要可以将这个属性重置为never 完整性保护
// any 顶端类型  最大的类型
// object 非原始类型 对象、函数、数组
// bigInt symbol 类型
// 包装类型 String Number Boolean Object... 描述的是实例 (什么包装对象)

// 字面量类型 具体的值当做类型
// 联合类型 (并集 | 在二进制中有一个是1就是1， 没有赋值 默认只能调用公共方法)  交叉类型 （交叉的结果是子类型 & 都是1才是1）

// 断言 我们可以将某个类型直接断言成一个已经存在的类型 （双重断言）  非空断言！

// 函数类型：参数签名 和 返回值签名
// 函数的剩余参数 ...args:number[]  默认值  = 可选的参数 ?  this的问题用于声明类型
// 函数重载 function 伪重载（只是对类型的重载，输入和输出 存在着某种关联， 参数的个数不一致实现的逻辑也不一致）

// type X = keyof 索引类型查询（联合类型）、  typeof 类型查询

// 类：修饰符（private protected public readonly） 如果在类上使用实例属性需要先进行声明
// private constructor (单例模式)/ protected constructor（子类重写父类方法）
// 子类重写父类方法，类型要兼容

// 方法 原型方法和实力方法    原型方法: eat():void  实例方法：eat:()=>void  void类型表示不关心返回值

// type （主要是用于 | & 别名，编写一些复杂类型 可以使用type 条件类型 keyof typeof ）
// interface (描述形状的，extends继承，implements实现方法) 抽象的

// 接口 ？ 可选属性 readonly 仅读的  任意属性[key:string]:any 可索引属性[key:number]:any
// extends implements () . 接口的类型也可以通过 [] 获取 “索引访问" Person[keyof xxx]

// 泛型：类似于函数的参数 （占坑） 等会使用的时候传递类型。 对应占坑的变量来说不会发生变化
// 默认泛型、泛型约束 extends  (可以约束传递的类型， 和条件类型连用的情况比较多)

// 条件类型 <T extends xxx>T extends 条件 ？ 成立；不成立
// 谁是谁的父级  类型的层级  never < 字面量 < 基础类型 < 包装类型 < Object < any / unknown

// 条件类型如果传入的泛型是联合类型 （3点产生类型分发的问题） 分发具有两面性 , 不好的时候我们就需要禁用类型分发
// 禁用分发 T & {} . [T] , T[]

// 内置条件类型 exclude extract  基于条件来实现的

// 类型推断 inference infer 推断
// infer 关键字 只能用在条件类型中 用来提取类型的某一个部分的类型，放在不同的位置 就可以帮我们取不同位置的类型
function getUser(name: string, age: number) {
  return { name, age, address: {} };
}
// type ReturnType<T extends (...args: any[]) => any> = T extends (
//   ...args: any[]
// ) => infer R
//   ? R
//   : never;
type T1 = ReturnType<typeof getUser>; //type T1 = { name: string; age: number; address: {}; }

// ReturnType,Parameters,InstanceType 内置的类型

// type Parameters<T extends (...args: any[]) => any> = T extends (
//   ...args: infer P
// ) => any
//   ? P
//   : never;
type P1 = Parameters<typeof getUser>; //type P1 = [name: string, age: number]

class Person {
  constructor() {
    return { a: 1, b: 2 };
  }
} // Person的实例类型是什么? Person

type InstanceType<T extends new (...args: any[]) => any> = T extends {
  new (...args: any[]): infer I;
}
  ? I
  : never;
type I1 = InstanceType<typeof Person>; // 内置的

// 构造函数的类型
type ConstructorParameters<T extends new (...args: any[]) => any> =
  T extends new (...args: infer P) => any ? P : never;
type T5 = ConstructorParameters<typeof Person>; // type T5 = []

//  ["jw", 30, 40, 50, "回龙观"]  ==> ["回龙观","jw",30,40,50]
type TailToHead<T extends any[]> = T extends [...infer C, infer B]
  ? [B, ...C]
  : any;
type x = TailToHead<["jw", 30, 40, 50, "回龙观"]>;

// 将元组转换成联合类型
type ElementOf<T> = T extends Array<infer R> ? R : any;
type TupleToUnion = ElementOf<[string, number, boolean]>; // type TupleToUnion = string | number | boolean

// 判断 promise的返回类型
type PromiseV<T> = T extends Promise<infer P> ? PromiseV<P> : T;
type PromiseReturnValue = PromiseV<Promise<Promise<number>>>; // type PromiseReturnValue = number

// infer 就是推导条件中的某个部分

export {};
