// 学习ts 就是学习TS中的类型

// 常见的类型： 基础类型、高级类型 = 自定义类型 ts包中内置了很多类型

// TS中冒号后面的都是类型标识，等号后面是值

// 1）ts 类型是从安全的角度出发的， 一切从安全角度来考虑
// 2）ts 是在开发的时候来检测 不是在运行的时候，所以代码并没有被真正的执行
// 3）ts 中是具备一个类型推导的特点，不是所有的变量都需要增加类型。 只有无法推断或者推断错误的时候我们才需要编写类型

// ts 最终编译后 类型就消失了 （类型就是空气）

// 1） 先给js的原始数据类型能进行标识

let name: string = "zhang";
let age: number = 30;
let sex: boolean = true;

// 原始数据类型 都要采用小写的类型， 大写类型（包装的类型）用来描述的实例

// let s1: string = "abc";
// let s2: string = new String("abc"); //报错，String类型不能分配给 string
// let s3: String = new String("abc");
// let s4: String = "abc";

// "abc".charAt // 默认当我们调用基本类型的方法时 会将当前基本类型包装成对象类型

// 在ts之中 大写类型 可以描述实例
// 包装对象

// 2）数组的类型： [] 数组的概念  数组是多个相同类型的数据集合  js中数组可以随意存放
// ts中有两种方式可以标注数组类型

let arr1: number[] = [1, 2, 3, 4];
let arr2: string[] = ["a", "b", "c", "d"];
let arr3: (string | number)[] = [1, 2, 3, 4, "a", "b", "c"]; // 联合类型，这种报错： let arr3: string | number[] = [1, 2, 3, 4, "a", "b", "c"];
let arr4: Array<string> = ["a", "b", "c"]; // 采用泛型来声明数组

// ts 中的元组 （特点就是长度固定、类型固定）
let tuple: [string, number, boolean] = ["zhang", 19, true];
// let tuple1: [name: string, age: number, sex: boolean] = ["zhang", 19, true]; // 可以这样标识元组每一项是什么

// 元组可以通过数组的方法 进行新增。 只能新增已经存在的类型。 而且就算放进去了也拿不出来
// tuple.push(4);// push null会报错
// let username = tuple[3]; //报错: 长度为3 的元组类型在索引中不存在

// 3） ts中的枚举 自带类型的对象, 枚举的值 如果没有赋值 从0开始 递增的. 反举 只能在我们值为数字的情况
// 数字枚举; 字符串枚举; 异构枚举(字符串和数字连用，很少使用);
enum USER_ROLE {
  USER,
  ADMIN,
  SUPER_ADMIN,
}
const enum USER_ROLE1 {
  USER = "a",
  ADMIN = 10,
  SUPER_ADMIN,
}
console.log("USER_ROLE:", USER_ROLE);
console.log(USER_ROLE[0]);
// console.log("USER_ROLE1:", USER_ROLE1); //如果enum类型前加 const变成常量枚举，这里会报错："const" 枚举仅可在属性、索引访问表达式、导入声明的右侧、导出分配或类型查询中使用
/*
  USER_ROLE: {
    '0': 'USER',
    '1': 'ADMIN',
    '2': 'SUPER_ADMIN',
    USER: 0,
    ADMIN: 1,
    SUPER_ADMIN: 2
  }
  USER
  USER_ROLE1: {
    '10': 'ADMIN',
    '11': 'SUPER_ADMIN',
    USER: 'a',
    ADMIN: 10,
    SUPER_ADMIN: 11
  }
*/
let a: USER_ROLE.ADMIN = 1;

// 像代码中的常量 可以全部采用枚举类型，提示友好,使用方便
// 常量枚举不能反举 （一般用不到反举，都采用常量枚举） 不会生成对象，而是直接将值拿出来了
// 常量枚举用于： 状态码 、 接口的定义  、权限、 标示位

// 4) null undefined 默认情况下  null 和 undefined 只能赋予给 null undefined
let nn = null; //此处 nn 为 any 类型
let uu = undefined; //此处 uu 为 any 类型
const n: null = null; //此处 n 为 null 类型
const u: undefined = undefined; //此处 u 为 undefined 类型

// 如果在非严格null检测的情况下（tsconfig.json中"strictNullChecks": false） ， 那么undefined 和 null 是任何类型的子类型，下面不报错，否则报错
// const m: null = undefined;
// const mm: undefined = null;
let s: string = "abc";
s = undefined;

// 5) void 类型 空类型  函数的返回值 可以用void来标识， 其他情况下用不到
// undefined 区别 void
function fn1() {} //返回值为 void
function fun2() {
  //返回值为 void
  return;
}
function fn3(): void | null {
  // 非严格 null 检测，undefined 可以赋予给void
  return null;
}

// never 类型  任何类型的子类型， never意味着 这个值不可能出现
// nerver 可以赋值给其它类型，其它类型不能赋值给 nerver

// - 1) 函数无法到达终点
function whileTrue(): never {
  while (true) {}
}
function throwError(): never {
  throw new Error();
}
// never 后代码不执行
function test() {
  throwError();
  let a = 1; // 提示：检测到无法访问的代码
}

// 校验逻辑的完整性 可以利用never特性  实现完整性保护
function validateCheck(v: never) {}
function getResult(strOrBooleanOrNum: string | number | boolean) {
  if (typeof strOrBooleanOrNum == "string") {
    return "string";
  } else if (typeof strOrBooleanOrNum == "number") {
    return "number";
  } else if (typeof strOrBooleanOrNum == "boolean") {
    return "boolean";
  } else {
    // 不写 boolean情况，报错：类型“boolean”的参数不能赋给类型“never”的参数
    validateCheck(strOrBooleanOrNum);
    return "";
  }
  //如果达不到never 则可以正常的运行
  //   let n: never = strOrBooleanOrNum;
}

// Object.create({})
// 大写的 Object 类型 不用 （万物接对象 最终都会找到Object）
// {} 字面量类型  {} = new Object 一般不会这样使用
function create(target: object) {}
create(function () {});
create([]);
create({});
// create(123);// 报错：类型“number”的参数不能赋给类型“object”的参数

// symbol 和 bigint 基本不使用
const s1: symbol = Symbol();
const s2: symbol = Symbol();
console.log(s1 === s2); // false
const big: bigint = BigInt(Number.MAX_SAFE_INTEGER + 100); // bigint不能赋予给number

// string number boolean null undefined 枚举 元祖 数组 nevenr void object symbol bigint

// any 不进行类型检测，一但用户写了any 之后 所有校验都消失了。 如果一个变量声明的时候没有赋值默认也是any
let arr: any = []; // 能不写any 就不写any 写多了 变成anyScript
arr();
arr.xxx;
arr = [];
// 出问题了 自己负责

// 开发的时候是模块化开发，解决命名冲突，开辟单独内容空间
export {};
