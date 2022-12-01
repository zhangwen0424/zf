// 回顾
// infer 只能在条件类型中使用， 用来取部分类型的  ReturnType、Paramaters、instanceType...

// ts中的兼容性问题 （ts类型是结构化的类型系统 鸭子类型） 结构检测 ， 类型角度来考虑兼容性 子类型可以赋予给父类型

// 联合类型的兼容性问题：联合类型中的任意一个类型都可以赋予给联合类型  number|string = number
// 交叉类型 交叉后的类型是子类型，子类型可以赋予给交叉前的任何一个类型 A =  A & B . B =  A & B
// 接口，类，结构， 多的可以赋予给少的 （多的是基于少的进行扩展了）  A extends B .  B  =  A
// 函数类型兼容性 函数的参数个数，定义的类型个数可以大于实际的个数。 返回值类型 void 表示的是不关心返回值
// 逆变和协变  参数可以是逆变  A < B  Box<A> > Box<B>  函数的参数可以传递父类
// 协变就是 A < B . A < B . (特性：考虑安全) {concat():void,push():void} 禁用参数逆变

// 类型推断
// 1) 赋值推断。 默认的推导都是从右边到左边
// 2) 函数的返回值是可以自动推导的
// 3) 反向推断， 从左向右的方式， 上下文推断 （参数按照编写位置进行推断，返回值也是一样）

// 类型保护 （联合类型的问题）
// typeof instanceof in
// 可辨识联合类型 （结构有唯一标识）
// is 语法 ts语法， 可以判断某个类型
// null 保护

// unknown 用的时候需要先确定类型再使用 ， unknown 是any的安全类型 （any的地方可以考虑换成unknown）

// （条件类型 Exlcude Extract 集合操作）映射类型（结构上的操作）
// 修饰作用 Partial ?   、 Required   -? 、readonly   -readonly
// 重构结构类型 Pick Omit
// Record 用来替换掉object类型  =》 key,value 采用Record类型

// 重映射语法  as 某个新的内容

// 命名空间 namesapce 扩展的特点 平时用的不多 内部模块 、 外部模块 import type export (import x = require(), export=)
// 声明类型 declare关键字 （.d.ts） 查找规范 paths > 第三方包中找 > @types
// 引入别人的模块非ts模块 declare module declare xxx

type name = "zw"; // 模板字符串类型的目的就是将多个字符串组装在一起
type sayHaha = `hi ${name}`; // type sayHaha = "hi zw"

// 模板字符串具备一个分发的机制

// marign-left margin-top margin-bottom
type Direction = "left" | "right" | "top" | "bottom";
type AllMargin = `margin-${Direction}`; // type AllMargin = "margin-left" | "margin-right" | "margin-top" | "margin-bottom"

// scss 写颜色 red-100 red-200 red-300
// element-plus primary-light-1 primary-light-2....
// sku  规格 红色-10cm  黄色-20cm
type IColor = "red" | "yellow" | "green";
type ISize = 100 | 200 | 300;
type ProductSKU = `${IColor}-${ISize}`; // type ProductSKU = "red-100" | "red-200" | "red-300" | "yellow-100" | "yellow-200" | "yellow-300" | "green-100" | "green-200" | "green-300"

type sayHehe<T extends string | number | bigint | boolean | null | undefined> =
  `hehe ${T}`;
type V1 = sayHehe<"zw">; // type V1 = "hehe zw"
type V2 = sayHehe<123>; // type V2 = "hehe 123"
type V3 = sayHehe<123n>; // type V3 = "hehe 123"
type V4 = sayHehe<true>; // type V4 = "hehe true"
type V5 = sayHehe<null | undefined>; // type V5 = "hehe undefined" | "hehe null"
type V6 = sayHehe<string>; // type V6 = `hehe ${string}`

type isChild = V1 extends V6 ? true : false;

type Person = { name: string; age: number; address: string };

// 重命名 Person
type RenamePerson<T, X extends keyof T> = {
  [K in keyof T as K extends X ? `rename_${K & string}` : K]: T[K];
};
type a1 = RenamePerson<Person, "name">;

// 针对模板字符串 内部有很多专门的类型 可以供我们使用
// Uppercase Lowercase Capitalize Uncaptailize

// 映射成函数
type PersonGetter<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K];
};
let person!: PersonGetter<Person>;
type x = PersonGetter<Person>; //type x = { getName: () => string; getAge: () => number; getAddress: () => string; }
person.getName();
person.getAge();
person.getAddress();

// vue jsx 写法

// type Emits = {a:()=>{},b:()=>{},c:()=>{}}
// {onA:()=>{},onB:()=>{},onC:()=>{}}

// 和元组的infer  [infer L,...infer R] L 是第一个

// 模板字符串可以用infer
type GetFirstName<S extends string> = S extends `${infer L} ${infer R}`
  ? L
  : any;
type FirstName = GetFirstName<"zhang wen">;

export {};
